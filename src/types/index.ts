import { ConnectionConfig, Pool } from 'mysql';
import TransportStream = require('winston-transport');


export interface WinstonMysqlTransportOptions extends TransportStream.TransportStreamOptions {

    mysqlConfig: ConnectionConfig;
    table: string;
    fields?: {
        level: string;
        meta: string;
        message: string;
        timestamp: string;
        [key: string]: string;
    };
    pool?: Pool;

}
