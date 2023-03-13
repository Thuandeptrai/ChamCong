import cron from 'node-cron'
import {spawn} from 'child_process'

export const dbBackup = (dbName: string, pathToSave: string) => cron.schedule('59 23 * * *', () => {
    let backupProcess = spawn('mongodump', [
        `--db=${dbName}`,
        `--archive=${pathToSave}/${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()}`,
        '--gzip',
    ])

    backupProcess.on('exit', (code, signal) => {
        if(code) 
            console.log('Backup process exited with code ', code);
        else if (signal)
            console.error('Backup process was killed with singal ', signal);
        else 
            console.log('Successfully backedup the database')
    });
});