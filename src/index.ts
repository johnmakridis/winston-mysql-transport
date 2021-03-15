import mysql from 'mysql';
import Transport = require('winston-transport');
import { WinstonMysqlTransportOptions } from './types';


export class WinstonMySqlTransport extends Transport {

    options: WinstonMysqlTransportOptions;
    pool: mysql.Pool;

    constructor(options: WinstonMysqlTransportOptions) {

        super(options);

        if (!options.mysqlConfig.user)
            throw new Error('The database username is required');

        if (!options.mysqlConfig.database)
            throw new Error('The database name is required');

        if (!options.table)
            throw new Error('The database table is required');


        if (!options.fields) // use default names
            options.fields = {
                level: 'level',
                meta: 'meta',
                message: 'message',
                timestamp: 'timestamp'
            };

        this.options = options;

        if (!this.options.pool)
            this.pool = mysql.createPool(this.options.mysqlConfig);

    }

    log(info: any, callback: Function): any {

        process.nextTick(() => {

            this.pool.getConnection((err, connection) => {

                if (err)
                    return callback(err, null);

                const log: any = {};

                for (const [field, value] of Object.entries(info))
                    if (field === 'level')
                        log[this.options.fields.level] = value;

                    else if (field === 'message')
                        log[this.options.fields.message] = value;

                    else if (field === 'meta')
                        log[this.options.fields.meta] = value ? JSON.stringify(value) : null;

                    else
                        for (const [customFieldKey, customFieldValue] of Object.entries(this.options.fields))
                            if (field === customFieldKey)
                                log[customFieldValue] = value;


                log[this.options.fields.timestamp] = new Date();

                connection.query(`INSERT INTO ${this.options.table} SET ?`, log, (error, rows, fields) => {
                    if (error)
                        return callback(error, null);

                    connection.release();

                    callback(null, true);

                });

            });

        });

    }

}
