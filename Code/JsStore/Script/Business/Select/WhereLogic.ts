module JsStore {
    export module Business {
        export module Select {
            export class Where extends Like {

                private executeRequest = function (column, value, op) {
                    var That = this,
                        CursorOpenRequest,
                        executeSkipAndLimit = function () {
                            var RecordSkipped = false;
                            CursorOpenRequest.onsuccess = function (e) {
                                var Cursor: IDBCursorWithValue = (<any>e).target.result;
                                if (Cursor) {
                                    if (RecordSkipped && That.Results.length != That.LimitRecord) {
                                        if (!That.CheckFlag) {
                                            That.Results.push(Cursor.value);
                                        }
                                        else if (That.checkForWhereConditionMatch(Cursor.value)) {
                                            That.Results.push(Cursor.value);
                                        }
                                        Cursor.continue();
                                    }
                                    else {
                                        RecordSkipped = true;
                                        Cursor.advance(That.SkipRecord);
                                    }
                                }
                            }
                        },
                        executeSkip = function () {
                            var RecordSkipped = false;
                            CursorOpenRequest.onsuccess = function (e) {
                                var Cursor: IDBCursorWithValue = (<any>e).target.result;
                                if (Cursor) {
                                    if (RecordSkipped) {
                                        if (!That.CheckFlag) {
                                            That.Results.push(Cursor.value);
                                        }
                                        else if (That.checkForWhereConditionMatch(Cursor.value)) {
                                            That.Results.push(Cursor.value);
                                        }
                                        Cursor.continue();
                                    }
                                    else {
                                        RecordSkipped = true;
                                        Cursor.advance(That.SkipRecord);
                                    }
                                }
                            }
                        },
                        executeLimit = function () {
                            CursorOpenRequest.onsuccess = function (e) {
                                var Cursor: IDBCursorWithValue = (<any>e).target.result;
                                if (Cursor && That.Results.length != That.LimitRecord) {
                                    if (!That.CheckFlag) {
                                        That.Results.push(Cursor.value);
                                    }
                                    else if (That.checkForWhereConditionMatch(Cursor.value)) {
                                        That.Results.push(Cursor.value);
                                    }
                                    Cursor.continue();
                                }
                            }
                        },
                        executeSimple = function () {
                            CursorOpenRequest.onsuccess = function (e) {
                                var Cursor: IDBCursorWithValue = (<any>e).target.result;
                                if (Cursor) {
                                    if (!That.CheckFlag) {
                                        That.Results.push(Cursor.value);
                                    }
                                    else if (That.checkForWhereConditionMatch(Cursor.value)) {
                                        That.Results.push(Cursor.value);
                                    }
                                    Cursor.continue();
                                }
                            }
                        };

                    value = op ? value[op] : value;
                    CursorOpenRequest = this.ObjectStore.index(column).openCursor(this.getKeyRange(value, op));

                    if (this.SkipRecord && this.LimitRecord) {
                        executeSkipAndLimit();
                    }
                    else if (this.SkipRecord) {
                        executeSkip();
                    }
                    else if (this.LimitRecord) {
                        executeLimit();
                    }
                    else {
                        executeSimple();
                    }

                    CursorOpenRequest.onerror = function (e) {
                        That.ErrorOccured = true;
                        That.onErrorOccured(e);
                    }
                }

                protected executeWhereLogic = function () {
                    var Column = this.getObjectFirstKey(this.Query.Where);
                    if (this.ObjectStore.indexNames.contains(Column)) {
                        var Value = this.Query.Where[Column];
                        if (typeof Value == 'object') {
                            this.CheckFlag = Boolean(Object.keys(Value).length || Object.keys(this.Query.Where).length);
                            var Key = this.getObjectFirstKey(Value);
                            switch (Key) {
                                case 'Like': {
                                    var FilterValue = Value.Like.split('%');
                                    if (FilterValue[1]) {
                                        if (FilterValue.length > 2) {
                                            this.executeLikeLogic(Column, FilterValue[1], Occurence.Any);
                                        }
                                        else {
                                            this.executeLikeLogic(Column, FilterValue[1], Occurence.Last);
                                        }
                                    }
                                    else {
                                        this.executeLikeLogic(Column, FilterValue[0], Occurence.First);
                                    }
                                }; break;
                                case 'In': {
                                    for (var i = 0; i < Value['In'].length; i++) {
                                        this.executeRequest(Column, Value['In'][i])
                                    }
                                }; break;
                                case '-':
                                case '>':
                                case '<':
                                case '>=':
                                case '<=':
                                    this.executeRequest(Column, Value, Key);
                                    break;
                                default: this.executeRequest(Column, Value);
                            }
                        }
                        else {
                            this.CheckFlag = Boolean(Object.keys(this.Query.Where).length);
                            this.executeRequest(Column, Value);
                        }
                    }
                    else {
                        this.ErrorOccured = true;
                        this.Error = Utils.getError(ErrorType.ColumnNotExist, { ColumnName: Column });
                        throwError(this.Error);
                    }
                }
            }
        }
    }
}