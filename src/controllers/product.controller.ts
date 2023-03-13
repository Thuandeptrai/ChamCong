import { Request, Response, NextFunction } from 'express';
import ProductModel from '../models/product.model';
import logging from '../config/logging';
import { convertDataToSyncData, RESPONSE_STATUS, SORT } from '../utils';
import { callApiViettel } from '../middleware';
import { responseModel } from '../utils/responseModel';
import { axiosClientAuth } from '../services/axiosClient';
import { AuthRquest } from '../interfaces';

const NAME_SPACE = 'Product';

export const syncDataProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'syncDataProduct');

    const allOrderPagesParent = await callApiViettel({
      call: 'getOrderPages',
    });

    const { categories } = allOrderPagesParent;

    const subCategories = await Promise.all(
      categories.map(async (item: any) => {
        const subCategory = await callApiViettel({
          call: 'getSubCategories',
          id: item?.id,
        });
        const { subcategories } = subCategory;

        return subcategories || [];
      })
    );

    const allOrderPagesChild: any[] = [];

    subCategories.forEach((item: any[]) => {
      allOrderPagesChild.push(...item);
    });

    const allProductsByBigOrderPage = await Promise.all(
      categories.map(async (item: any) => {
        const temp = await callApiViettel({
          call: 'getProducts',
          id: item?.id,
        });
        const { products } = temp;

        return products;
      })
    );

    const allProductsByOrderPage = await Promise.all(
      allOrderPagesChild.map(async (item) => {
        const temp = await callApiViettel({
          call: 'getProducts',
          id: item?.id,
        });
        const { products } = temp;

        return products;
      })
    );

    const allProductIds: string[] = [];

    [...allProductsByBigOrderPage, ...allProductsByOrderPage].forEach(
      (item: any) => {
        allProductIds.push(...Object.keys(item));
      }
    );

    const allProducts = await Promise.all(
      allProductIds.map(async (id: string) => {
        const temp = await callApiViettel({
          call: 'getProductDetails',
          id,
        });

        const { product } = temp;
        return product;
      })
    );
    await ProductModel.remove({});

    await ProductModel.insertMany(convertDataToSyncData(allProducts));

    return res.status(200).json({
      status: RESPONSE_STATUS.SUCCESS,
      data: allProducts,
      message: 'Sync data product from Manager idcviettel to my database',
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error syncDataProduct', error);
    next(error);
  }
};

export const getProductsBySubOrderPage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'getProductsBySubOrderPage');

    const { id } = req.params;

    const result = await ProductModel.aggregate([
      {
        $match: {
          category_id: Number(id),
          visible: 1,
        },
      },
      {
        $sort: {
          sort_order: SORT.UP,
        },
      },
    ]);

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get products by sub order page',
      result
    );

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getProductsBySubOrderPage', error);
    next(error);
  }
};

export const getProductDetailForConfig = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'getProductDetailForConfig');
    const { id } = req.params;
    const { accesstoken } = req.user as any;

    const result = await axiosClientAuth(accesstoken).get(`/order/${id}`);

    const { product } = result?.data;

    const response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get products by sub order page',
      product
    );

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getProductDetailForConfig', error);
    next(error);
  }
};

export const getProductDetail = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'getProductDetail');
    const { id } = req.params;

    const result = await ProductModel.findOne({
      object_id: Number(id),
    });

    let response = responseModel(
      RESPONSE_STATUS.SUCCESS,
      'Get products detail by id',
      result as any
    );

    if (!result) {
      response = responseModel(
        RESPONSE_STATUS.FAILED,
        'Product not found',
        null
      );
      return res.status(400).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getProductDetail', error);
    next(error);
  }
};
export const getpagingProduct = async (
  req: AuthRquest,
  res: Response,
  next: NextFunction
) => {
  try {
    logging.info(NAME_SPACE, 'getpagingProduct');
    const pageSize = req.query.pageSize || 10;
    const pageIndex = req.query.pageIndex || 1;

    let searchObj = {} as any;
    if (req.query.search) {
      searchObj = {
        name: { $regex: '.*' + req.query.search + '.*' },
      };
    }
    const data = await ProductModel.find(searchObj)
      .skip(Number(pageSize) * Number(pageIndex) - Number(pageSize))
      .limit(Number(pageSize))
      .sort({
        createdAt: 'desc',
      });

    const count = await ProductModel.find(searchObj).countDocuments();
    const totalPages = Math.ceil(count / Number(pageSize));
    return res.status(200).json({
      data: data,
      pageSize: pageSize,
      pageIndex: pageIndex,
      count: count,
      totalPages: totalPages,
    });
  } catch (error) {
    logging.error(NAME_SPACE, 'Error getpagingProduct', error);
    next(error);
  }
};
