import { API } from "./enums";
import { InstanceHelper } from "./instance_helper";
import {
    IDataBase, ISelect, ICount, IInsert,
    IUpdate, IRemove, IDbInfo, ITranscationQry
} from "./interfaces";
import { Config } from "./config";
import { ISet } from "../worker/interfaces";
import { Util } from "./util";

export class Instance extends InstanceHelper {

    constructor(worker?: Worker) {
        super(worker);
    }

    /**
     *  open database
     * 
     * @param {string} dbName 
     * @returns 
     * @memberof Instance
     */
    openDb(dbName: string) {
        return this.pushApi<null>({
            name: API.OpenDb,
            query: dbName
        });
    }

    /**
     * creates DataBase
     * 
     * @param {IDataBase} dataBase 
     * @returns 
     * @memberof Instance
     */
    createDb(dataBase: IDataBase) {
        return this.pushApi<string[]>({
            name: API.CreateDb,
            query: dataBase
        });
    }

    /**
     * drop dataBase
     * 
     * @returns 
     * @memberof Instance
     */
    dropDb() {
        return this.pushApi<null>({
            name: API.DropDb,
            query: null
        });
    }

    /**
     * select data from table
     * 
     * @template T 
     * @param {ISelect} query 
     * @returns 
     * @memberof Instance
     */
    select<T>(query: ISelect) {
        return this.pushApi<T[]>({
            name: API.Select,
            query: query
        });
    }

    /**
     * get no of record from table
     * 
     * @param {ICount} query 
     * @returns 
     * @memberof Instance
     */
    count(query: ICount) {
        return this.pushApi<number>({
            name: API.Count,
            query: query
        });
    }

    /**
     * insert data into table
     * 
     * @param {IInsert} query 
     * @returns 
     * @memberof Instance
     */
    insert<T>(query: IInsert) {
        return this.pushApi<number | T[]>({
            name: API.Insert,
            query: query
        });
    }

    /**
     * update data into table
     * 
     * @param {IUpdate} query 
     * @returns 
     * @memberof Instance
     */
    update(query: IUpdate) {
        return this.pushApi<number>({
            name: API.Update,
            query: query
        });
    }

    /**
     * remove data from table
     * 
     * @param {IRemove} query 
     * @returns 
     * @memberof Instance
     */
    remove(query: IRemove) {
        return this.pushApi<number>({
            name: API.Remove,
            query: query
        });
    }

    /**
     * delete all data from table
     * 
     * @param {string} tableName 
     * @returns 
     * @memberof Instance
     */
    clear(tableName: string) {
        return this.pushApi<null>({
            name: API.Clear,
            query: tableName
        });
    }

    /**
     * insert bulk amount of data
     * 
     * @param {IInsert} query 
     * @returns 
     * @memberof Instance
     */
    bulkInsert(query: IInsert) {
        return this.pushApi<null>({
            name: API.BulkInsert,
            query: query
        });
    }

    /**
     *  export the result in json file
     * 
     * @param {ISelect} query 
     * @returns 
     * @memberof Instance
     */
    exportJson(query: ISelect) {
        const onSuccess = (url) => {
            const link = document.createElement("a");
            link.href = url;
            link.download = query.from + ".json";
            link.click();
        };

        return new Promise<null>((resolve, reject) => {
            this.pushApi({
                name: API.ExportJson,
                query: query
            }).then(url => {
                onSuccess(url);
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }

    /**
     * set log status
     * 
     * @param {boolean} status 
     * @memberof Instance
     */
    setLogStatus(status: boolean) {
        Config.isLogEnabled = status ? status : Config.isLogEnabled;
        this.pushApi({
            name: API.ChangeLogStatus,
            query: Config.isLogEnabled
        });
    }

    /**
     * get version of database
     * 
     * @param {(string | IDbInfo)} dbName 
     * @returns 
     * @memberof Instance
     */
    getDbVersion(dbName: string | IDbInfo) {
        return this.pushApi<number>({
            name: API.GetDbVersion,
            query: dbName
        });
    }

    /**
     * is database exist
     * 
     * @param {(IDbInfo | string)} dbInfo 
     * @returns 
     * @memberof Instance
     */
    isDbExist(dbInfo: IDbInfo | string) {
        return this.pushApi<boolean>({
            name: API.IsDbExist,
            query: dbInfo
        });
    }

    /**
     * returns list of database created
     * 
     * @returns 
     * @memberof Instance
     */
    getDbList() {
        return this.pushApi<string[]>({
            name: API.GetDbList,
            query: null
        });
    }

    /**
     * get Database Schema
     * 
     * @param {string} dbName 
     * @returns 
     * @memberof Instance
     */
    getDbSchema(dbName: string) {
        return this.pushApi<IDataBase>({
            name: API.GetDbSchema,
            query: dbName
        });
    }

    /**
     * get the value from keystore table
     * 
     * @param {string} key 
     * @returns 
     * @memberof Instance
     */
    get(key: string) {
        return this.pushApi<any>({
            name: API.Get,
            query: key
        });
    }

    /**
     * set the value in keystore table 
     * 
     * @param {string} key 
     * @param {*} value 
     * @returns 
     * @memberof Instance
     */
    set(key: string, value: any) {
        return this.pushApi<any>({
            name: API.Set,
            query: {
                key: key, value: value
            } as ISet
        });
    }

    /**
     * terminate the connection
     *
     * @returns
     * @memberof Instance
     */
    terminate() {
        return this.pushApi<any>({
            name: API.Terminate,
            query: null
        });
    }

    /**
     * execute the transaction
     *
     * @param {ITranscationQry} query
     * @returns
     * @memberof Instance
     */
    transaction(query: ITranscationQry) {
        (query.logic as any) = query.logic.toString();
        return this.pushApi<any>({
            name: API.Transaction,
            query: query
        });
    }

    /**
     * run sql code
     *
     * @param {(string | object)} query
     * @returns {Promise<any>}
     * @memberof Instance
     */
    runSql(query: string | object): Promise<any> {
        const result = Util.sqlWeb.parseSql(query);
        return this[result.api](result.data);
    }
}