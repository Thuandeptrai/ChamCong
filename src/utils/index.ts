export enum RESPONSE_STATUS {
  SUCCESS = 1,
  FAILED = 0,
  REDIRECT = 2,
}

export enum SORT {
  UP = 1,
  DOWN = -1,
}

export enum ID_STATUS {
  NONE = 0,
}

export enum VISIBLE {
  SHOW = 1,
  HIDDEN = 0,
}

export const generateRandomString = (length: number) => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  const n = length || 15;
  for (let i = 0; i < n; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

export enum SUB_ORDER_PAGE_ID {
  WINDOWS = '1',
  LINUX = '2',
}

export enum FORM_CREATE_NEW_SERVICE {
  OS_TEMPLATE = 'OS Template',
}

export const removeUndefinedProperties = (obj: any) => {
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] === undefined) {
      delete obj[key];
    }
  }
  return obj;
};

export const convertObjectToQuery = (obj: any) => {
  const keys = Object.keys(obj);
  let query = '?';
  keys.forEach((key) => {
    if (obj[key] !== undefined && obj[key] !== '') {
      query +=
        typeof obj[key] === 'string'
          ? `${key}=${obj[key]}&`
          : `${key}=${JSON.stringify(obj[key])}&`;
    }
  });
  return query;
};

export const convertDataToSyncData = (oldData: any[]) => {
  return oldData.map((item: any) => {
    const temp = item;
    temp['object_id'] = item?.id;

    return temp;
  });
};
