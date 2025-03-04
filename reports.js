"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.HoldersReportData = exports.DealsReportData = exports.Report = void 0;
//import ExcelJS from 'exceljs';
var ExcelJS = require('exceljs');
var Constants = require("./constants");
var graph_1 = require("./graph");
var utils_1 = require("./utils");
var node_fetch_1 = require("node-fetch");
var blockchain_1 = require("./blockchain");
var FileSaver = require('file-saver');
var ONE_UTC_DAY = 86400;
var Report = /** @class */ (function () {
    function Report(url) {
        if (url === void 0) { url = 'mainnet'; }
        this.url = url;
    }
    Report.prototype.getTransactionReportByArray = function (timeLow, timeHigh, tokensArray, addressesArray, hideNames) {
        if (hideNames === void 0) { hideNames = true; }
        return __awaiter(this, void 0, void 0, function () {
            var workbook, promises, i, sheet, error_1, buffer, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workbook = new ExcelJS.Workbook();
                        promises = [];
                        for (i = 0; i < tokensArray.length; i++) {
                            sheet = workbook.addWorksheet(tokensArray[i].symbol);
                            promises.push(setTransactionSheetByArray(sheet, timeLow, timeHigh, addressesArray, this.url, tokensArray[i], hideNames));
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 10]);
                        return [4 /*yield*/, workbook.xlsx.writeFile('PiMarketsTransactionsReport.xlsx')];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 4:
                        error_1 = _a.sent();
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 5:
                        buffer = _a.sent();
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, FileSaver.saveAs(new Blob([buffer]), 'PiMarketsTransactionsReport.xlsx')];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        err_1 = _a.sent();
                        console.error(err_1);
                        return [3 /*break*/, 9];
                    case 9: return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getTransactionReportV2 = function (monthIndex, year, tokensArray, hideNames, name) {
        if (hideNames === void 0) { hideNames = true; }
        return __awaiter(this, void 0, void 0, function () {
            var workbook, toYear, toMonthIndex, timeLow, timeHigh, promises, i, sheet, error_2, buffer, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workbook = new ExcelJS.Workbook();
                        toYear = year;
                        toMonthIndex = monthIndex + 1;
                        if (monthIndex == 12) {
                            toYear = year + 1;
                            toMonthIndex = 1;
                        }
                        timeLow = getUtcTimeFromDate(year, monthIndex, 1);
                        timeHigh = getUtcTimeFromDate(toYear, toMonthIndex, 1);
                        promises = [];
                        for (i = 0; i < tokensArray.length; i++) {
                            sheet = workbook.addWorksheet(tokensArray[i].symbol);
                            promises.push(setTransactionSheet(sheet, timeLow, timeHigh, monthIndex, year, toMonthIndex, toYear, this.url, tokensArray[i], hideNames, name));
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 10]);
                        return [4 /*yield*/, workbook.xlsx.writeFile('PiMarketsTransactionsReportV2.xlsx')];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 4:
                        error_2 = _a.sent();
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 5:
                        buffer = _a.sent();
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, FileSaver.saveAs(new Blob([buffer]), 'PiMarketsTransactionsReportV2.xlsx')];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        err_2 = _a.sent();
                        console.error(err_2);
                        return [3 /*break*/, 9];
                    case 9: return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getTransactionReport = function (timeLow, timeHigh, name) {
        return __awaiter(this, void 0, void 0, function () {
            var workbook, sheet, transactions, rows, j, array, usdAmount, tableName, error_3, buffer, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workbook = new ExcelJS.Workbook();
                        sheet = workbook.addWorksheet("ALL_TXS");
                        if (!(name == undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, getAllTransactions(timeLow, timeHigh, this.url)];
                    case 1:
                        transactions = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, getAllTransactionsByName(timeLow, timeHigh, name, this.url)];
                    case 3:
                        transactions = _a.sent();
                        _a.label = 4;
                    case 4:
                        if (transactions.length > 0) {
                            rows = [];
                            for (j = 0; j < transactions.length; j++) {
                                array = [];
                                array.push(new Date(transactions[j].timestamp * 1000));
                                array.push(transactions[j].currency.tokenSymbol);
                                array.push(transactions[j].from.id);
                                if (transactions[j].from.name == null) {
                                    array.push("");
                                }
                                else {
                                    array.push(transactions[j].from.name.id);
                                }
                                array.push(transactions[j].to.id);
                                if (transactions[j].to.name == null) {
                                    array.push("");
                                }
                                else {
                                    array.push(transactions[j].to.name.id);
                                }
                                array.push(parseFloat((0, utils_1.weiToEther)(transactions[j].amount)));
                                usdAmount = 0;
                                array.push(usdAmount);
                                rows.push(array);
                            }
                            tableName = 'Tabla';
                            addTable(sheet, tableName, 'B2', [
                                { name: 'Fecha', filterButton: true },
                                { name: 'Divisa' },
                                { name: 'Origen (wallet)' },
                                { name: 'Origen (usuario)', filterButton: true },
                                { name: 'Destino (wallet)' },
                                { name: 'Destino (usuario)', filterButton: true },
                                { name: 'Monto', totalsRowFunction: 'sum' },
                                { name: 'Monto (USD)', totalsRowFunction: 'sum' }
                            ], rows);
                        }
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 13]);
                        return [4 /*yield*/, workbook.xlsx.writeFile('PiMarketsTransactionsReport.xlsx')];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 13];
                    case 7:
                        error_3 = _a.sent();
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 8:
                        buffer = _a.sent();
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, FileSaver.saveAs(new Blob([buffer]), 'PiMarketsTransactionsReport.xlsx')];
                    case 10:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        err_3 = _a.sent();
                        console.error(err_3);
                        return [3 /*break*/, 12];
                    case 12: return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getTokenHoldersReport = function (orderBy, orderDirection, tokensArray, hideNames) {
        if (hideNames === void 0) { hideNames = true; }
        return __awaiter(this, void 0, void 0, function () {
            var first, skip, queryTemplates, workbook, i, response, loopresponse, sheet, rows, j, array, tableName, skipOffers, offers, loopOffers, rows2, k, array2, tableName2, error_4, buffer, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        first = 1000;
                        skip = 0;
                        queryTemplates = new graph_1.QueryTemplates(this.url);
                        workbook = new ExcelJS.Workbook();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < tokensArray.length)) return [3 /*break*/, 16];
                        skip = 0;
                        return [4 /*yield*/, queryTemplates.getTokenHolders(orderBy, orderDirection, first, skip, tokensArray[i].address)];
                    case 2:
                        response = _a.sent();
                        loopresponse = response;
                        _a.label = 3;
                    case 3:
                        if (!(loopresponse.length >= 1000)) return [3 /*break*/, 5];
                        skip = response.length;
                        return [4 /*yield*/, queryTemplates.getTokenHolders(orderBy, orderDirection, first, skip, tokensArray[i].address)];
                    case 4:
                        loopresponse = _a.sent();
                        response = response.concat(loopresponse);
                        return [3 /*break*/, 3];
                    case 5:
                        sheet = workbook.addWorksheet(tokensArray[i].symbol);
                        sheet.getCell('B2').value = 'TOKEN';
                        sheet.getCell('B3').value = 'FECHA';
                        sheet.getCell('B2').font = { bold: true };
                        sheet.getCell('B3').font = { bold: true };
                        sheet.getCell('C2').value = tokensArray[i].symbol;
                        sheet.getCell('C3').value = getTime();
                        sheet.getCell('C6').value = 'HOLDERS';
                        sheet.getCell('C6').font = { bold: true };
                        rows = [];
                        for (j = 0; j < response.length; j++) {
                            array = [];
                            if (!hideNames) {
                                if (response[j].wallet.name == null) {
                                    array.push("");
                                }
                                else {
                                    array.push(response[j].wallet.name.id);
                                }
                            }
                            array.push(response[j].wallet.id);
                            array.push(parseFloat((0, utils_1.weiToEther)(response[j].balance)));
                            rows.push(array);
                        }
                        tableName = 'Tabla' + tokensArray[i].symbol;
                        if (!hideNames) return [3 /*break*/, 7];
                        if (rows.length == 0)
                            rows.push(["", 0]);
                        return [4 /*yield*/, addTable(sheet, tableName, 'B7', [
                                { name: 'Wallet', filterButton: true },
                                { name: 'Saldo', totalsRowFunction: 'sum' }
                            ], rows)];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 7:
                        if (rows.length == 0)
                            rows.push(["", "", 0]);
                        return [4 /*yield*/, addTable(sheet, tableName, 'B7', [
                                { name: 'Nombre', filterButton: true },
                                { name: 'Wallet' },
                                { name: 'Saldo', totalsRowFunction: 'sum' }
                            ], rows)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        skipOffers = 0;
                        return [4 /*yield*/, queryTemplates.getOffers('sellToken: "' + tokensArray[i].address + '", isOpen: true', 'sellAmount', 'desc', 1000, skipOffers)];
                    case 10:
                        offers = _a.sent();
                        loopOffers = offers;
                        _a.label = 11;
                    case 11:
                        if (!(loopOffers.length >= 1000)) return [3 /*break*/, 13];
                        skipOffers = offers.length;
                        return [4 /*yield*/, queryTemplates.getOffers('sellToken: "' + tokensArray[i].address + '", isOpen: true', 'sellAmount', 'desc', 1000, skipOffers)];
                    case 12:
                        offers = _a.sent();
                        offers = offers.concat(loopOffers);
                        return [3 /*break*/, 11];
                    case 13:
                        if (!(offers.length > 0)) return [3 /*break*/, 15];
                        sheet.getCell('G6').value = 'OFERTAS P2P';
                        sheet.getCell('G6').font = { bold: true };
                        rows2 = [];
                        for (k = 0; k < offers.length; k++) {
                            array2 = [];
                            if (hideNames) {
                                array2.push(offers[k].owner.id);
                            }
                            else {
                                array2.push(offers[k].owner.name);
                            }
                            array2.push(parseFloat((0, utils_1.weiToEther)(offers[k].sellAmount)));
                            rows2.push(array2);
                        }
                        tableName2 = 'P2P' + tokensArray[i].symbol;
                        return [4 /*yield*/, addTable(sheet, tableName2, 'F7', [
                                { name: 'Wallet', filterButton: true },
                                { name: 'Cantidad ofertada', totalsRowFunction: 'sum' }
                            ], rows2)];
                    case 14:
                        _a.sent();
                        _a.label = 15;
                    case 15:
                        i++;
                        return [3 /*break*/, 1];
                    case 16:
                        _a.trys.push([16, 18, , 24]);
                        return [4 /*yield*/, workbook.xlsx.writeFile('PiMarketsTokenHoldersReport.xlsx')];
                    case 17:
                        _a.sent();
                        return [3 /*break*/, 24];
                    case 18:
                        error_4 = _a.sent();
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 19:
                        buffer = _a.sent();
                        _a.label = 20;
                    case 20:
                        _a.trys.push([20, 22, , 23]);
                        return [4 /*yield*/, FileSaver.saveAs(new Blob([buffer]), 'PiMarketsTokenHoldersReport.xlsx')];
                    case 21:
                        _a.sent();
                        return [3 /*break*/, 23];
                    case 22:
                        err_4 = _a.sent();
                        console.error(err_4);
                        return [3 /*break*/, 23];
                    case 23: return [3 /*break*/, 24];
                    case 24: return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getTokenHoldersReportInArray = function (orderBy, orderDirection, tokensArray, holdersArray, hideNames) {
        if (hideNames === void 0) { hideNames = true; }
        return __awaiter(this, void 0, void 0, function () {
            var first, skip, queryTemplates, workbook, i, response, loopresponse, sheet, rows, j, array, tableName, error_5, buffer, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        first = 1000;
                        skip = 0;
                        queryTemplates = new graph_1.QueryTemplates(this.url);
                        workbook = new ExcelJS.Workbook();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < tokensArray.length)) return [3 /*break*/, 10];
                        skip = 0;
                        return [4 /*yield*/, queryTemplates.getTokenHoldersInArray(orderBy, orderDirection, first, skip, tokensArray[i].address, holdersArray)];
                    case 2:
                        response = _a.sent();
                        loopresponse = response;
                        _a.label = 3;
                    case 3:
                        if (!(loopresponse.length >= 1000)) return [3 /*break*/, 5];
                        skip = response.length;
                        return [4 /*yield*/, queryTemplates.getTokenHoldersInArray(orderBy, orderDirection, first, skip, tokensArray[i].address, holdersArray)];
                    case 4:
                        loopresponse = _a.sent();
                        response = response.concat(loopresponse);
                        return [3 /*break*/, 3];
                    case 5:
                        sheet = workbook.addWorksheet(tokensArray[i].symbol);
                        sheet.getCell('B2').value = 'TOKEN';
                        sheet.getCell('B3').value = 'FECHA';
                        sheet.getCell('B2').font = { bold: true };
                        sheet.getCell('B3').font = { bold: true };
                        sheet.getCell('C2').value = tokensArray[i].symbol;
                        sheet.getCell('C3').value = getTime();
                        sheet.getCell('C6').value = 'HOLDERS';
                        sheet.getCell('C6').font = { bold: true };
                        rows = [];
                        for (j = 0; j < response.length; j++) {
                            array = [];
                            if (!hideNames) {
                                if (response[j].wallet.name == null) {
                                    array.push("");
                                }
                                else {
                                    array.push(response[j].wallet.name.id);
                                }
                            }
                            array.push(response[j].wallet.id);
                            array.push(parseFloat((0, utils_1.weiToEther)(response[j].balance)));
                            rows.push(array);
                        }
                        tableName = 'Tabla' + tokensArray[i].symbol;
                        if (!hideNames) return [3 /*break*/, 7];
                        if (rows.length == 0)
                            rows.push(["", 0]);
                        return [4 /*yield*/, addTable(sheet, tableName, 'B7', [
                                { name: 'Wallet', filterButton: true },
                                { name: 'Saldo', totalsRowFunction: 'sum' }
                            ], rows)];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 7:
                        if (rows.length == 0)
                            rows.push(["", "", 0]);
                        return [4 /*yield*/, addTable(sheet, tableName, 'B7', [
                                { name: 'Nombre', filterButton: true },
                                { name: 'Wallet' },
                                { name: 'Saldo', totalsRowFunction: 'sum' }
                            ], rows)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        i++;
                        return [3 /*break*/, 1];
                    case 10:
                        _a.trys.push([10, 12, , 18]);
                        return [4 /*yield*/, workbook.xlsx.writeFile('PiMarketsTokenHoldersReport.xlsx')];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 18];
                    case 12:
                        error_5 = _a.sent();
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 13:
                        buffer = _a.sent();
                        _a.label = 14;
                    case 14:
                        _a.trys.push([14, 16, , 17]);
                        return [4 /*yield*/, FileSaver.saveAs(new Blob([buffer]), 'PiMarketsTokenHoldersReport.xlsx')];
                    case 15:
                        _a.sent();
                        return [3 /*break*/, 17];
                    case 16:
                        err_5 = _a.sent();
                        console.error(err_5);
                        return [3 /*break*/, 17];
                    case 17: return [3 /*break*/, 18];
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getPackableHoldersReport = function (orderBy, orderDirection, tokensArray, expiries, hideNames) {
        if (hideNames === void 0) { hideNames = true; }
        return __awaiter(this, void 0, void 0, function () {
            var first, skip, queryTemplates, workbook, i, response, loopresponse, sheet, rows, namesAllowed, j, array, tableName, skipOffers, offers, loopOffers, rows2, k, array2, tableName2, error_6, buffer, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        first = 1000;
                        skip = 0;
                        queryTemplates = new graph_1.QueryTemplates(this.url);
                        workbook = new ExcelJS.Workbook();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < tokensArray.length)) return [3 /*break*/, 16];
                        return [4 /*yield*/, queryTemplates.getPackableHolders(tokensArray[i].address, expiries[i][1], orderBy, orderDirection, first, skip)];
                    case 2:
                        response = _a.sent();
                        loopresponse = response;
                        _a.label = 3;
                    case 3:
                        if (!(loopresponse.length >= 1000)) return [3 /*break*/, 5];
                        skip = response.length;
                        return [4 /*yield*/, queryTemplates.getPackableHolders(tokensArray[i].address, expiries[i][1], orderBy, orderDirection, first, skip)];
                    case 4:
                        loopresponse = _a.sent();
                        response = response.concat(loopresponse);
                        return [3 /*break*/, 3];
                    case 5:
                        sheet = workbook.addWorksheet(tokensArray[i].symbol + '-' + expiries[i][0]);
                        sheet.getCell('B2').value = 'TOKEN';
                        sheet.getCell('B3').value = 'VENCIMIENTO';
                        sheet.getCell('B4').value = 'FECHA';
                        sheet.getCell('B2').font = { bold: true };
                        sheet.getCell('B3').font = { bold: true };
                        sheet.getCell('B4').font = { bold: true };
                        sheet.getCell('C2').value = tokensArray[i].symbol;
                        sheet.getCell('C3').value = expiries[i][0];
                        sheet.getCell('C4').value = getTime();
                        sheet.getCell('C6').value = 'HOLDERS';
                        sheet.getCell('C6').font = { bold: true };
                        rows = [];
                        namesAllowed = false;
                        if ((tokensArray[i].address == Constants.A.address) ||
                            (tokensArray[i].address == Constants.B.address) ||
                            (tokensArray[i].address == Constants.C.address) ||
                            (tokensArray[i].address == Constants.D.address) ||
                            (tokensArray[i].address == Constants.F.address)) {
                            namesAllowed = true;
                        }
                        for (j = 0; j < response.length; j++) {
                            array = [];
                            if ((!hideNames) || namesAllowed) {
                                if (response[j].wallet.name == null) {
                                    array.push("");
                                }
                                else {
                                    array.push(response[j].wallet.name.id);
                                }
                            }
                            array.push(response[j].wallet.id);
                            array.push(parseInt((0, utils_1.weiToEther)(response[j].balance)));
                            rows.push(array);
                        }
                        tableName = 'Tabla' + tokensArray[i].symbol + expiries[i][0];
                        if (!((hideNames) && !namesAllowed)) return [3 /*break*/, 7];
                        if (rows.length == 0)
                            rows.push(["", 0]);
                        return [4 /*yield*/, addTable(sheet, tableName, 'B7', [
                                { name: 'Wallet', filterButton: true },
                                { name: 'Saldo', totalsRowFunction: 'sum' }
                            ], rows)];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 7:
                        if (rows.length == 0)
                            rows.push(["", "", 0]);
                        return [4 /*yield*/, addTable(sheet, tableName, 'B7', [
                                { name: 'Nombre', filterButton: true },
                                { name: 'Wallet' },
                                { name: 'Saldo', totalsRowFunction: 'sum' }
                            ], rows)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        skipOffers = 0;
                        return [4 /*yield*/, queryTemplates.getPackableOffers('sellToken: "' + tokensArray[i].address + '", sellId: "' + expiries[i][1] + '", isOpen: true', 'sellAmount', 'desc', 1000, skipOffers)];
                    case 10:
                        offers = _a.sent();
                        loopOffers = offers;
                        _a.label = 11;
                    case 11:
                        if (!(loopOffers.length >= 1000)) return [3 /*break*/, 13];
                        skipOffers = offers.length;
                        return [4 /*yield*/, queryTemplates.getPackableOffers('sellToken: "' + tokensArray[i].address + '", sellId: "' + expiries[i][1] + '", isOpen: true', 'sellAmount', 'desc', 1000, skipOffers)];
                    case 12:
                        offers = _a.sent();
                        offers = offers.concat(loopOffers);
                        return [3 /*break*/, 11];
                    case 13:
                        if (!(offers.length > 0)) return [3 /*break*/, 15];
                        sheet.getCell('F6').value = 'NOTA: Si no coincide el saldo de Mercado P2P con el total ofertado hay que ver pactos pendientes';
                        sheet.getCell('F6').font = { color: { argb: "ff0000" } };
                        sheet.getCell('G5').value = 'OFERTAS P2P';
                        sheet.getCell('G5').font = { bold: true };
                        rows2 = [];
                        for (k = 0; k < offers.length; k++) {
                            array2 = [];
                            if (hideNames) {
                                array2.push(offers[k].owner.id);
                            }
                            else {
                                array2.push(offers[k].owner.name);
                            }
                            array2.push(parseInt((0, utils_1.weiToEther)(offers[k].sellAmount)));
                            rows2.push(array2);
                        }
                        tableName2 = 'P2P' + tokensArray[i].symbol;
                        return [4 /*yield*/, addTable(sheet, tableName2, 'F7', [
                                { name: 'Wallet', filterButton: true },
                                { name: 'Cantidad ofertada', totalsRowFunction: 'sum' }
                            ], rows2)];
                    case 14:
                        _a.sent();
                        _a.label = 15;
                    case 15:
                        i++;
                        return [3 /*break*/, 1];
                    case 16:
                        _a.trys.push([16, 18, , 24]);
                        return [4 /*yield*/, workbook.xlsx.writeFile('PiMarketsPackableHoldersReport.xlsx')];
                    case 17:
                        _a.sent();
                        return [3 /*break*/, 24];
                    case 18:
                        error_6 = _a.sent();
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 19:
                        buffer = _a.sent();
                        _a.label = 20;
                    case 20:
                        _a.trys.push([20, 22, , 23]);
                        return [4 /*yield*/, FileSaver.saveAs(new Blob([buffer]), 'PiMarketsPackableHoldersReport.xlsx')];
                    case 21:
                        _a.sent();
                        return [3 /*break*/, 23];
                    case 22:
                        err_6 = _a.sent();
                        console.error(err_6);
                        return [3 /*break*/, 23];
                    case 23: return [3 /*break*/, 24];
                    case 24: return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getPackableHoldersReportInArray = function (orderBy, orderDirection, tokensArray, expiries, holdersArray, hideNames) {
        if (hideNames === void 0) { hideNames = true; }
        return __awaiter(this, void 0, void 0, function () {
            var first, skip, queryTemplates, workbook, i, response, loopresponse, sheet, rows, namesAllowed, j, array, tableName, error_7, buffer, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        first = 1000;
                        skip = 0;
                        queryTemplates = new graph_1.QueryTemplates(this.url);
                        workbook = new ExcelJS.Workbook();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < tokensArray.length)) return [3 /*break*/, 10];
                        return [4 /*yield*/, queryTemplates.getPackableHoldersInArray(tokensArray[i].address, expiries[i][1], orderBy, orderDirection, first, skip, holdersArray)];
                    case 2:
                        response = _a.sent();
                        loopresponse = response;
                        _a.label = 3;
                    case 3:
                        if (!(loopresponse.length >= 1000)) return [3 /*break*/, 5];
                        skip = response.length;
                        return [4 /*yield*/, queryTemplates.getPackableHoldersInArray(tokensArray[i].address, expiries[i][1], orderBy, orderDirection, first, skip, holdersArray)];
                    case 4:
                        loopresponse = _a.sent();
                        response = response.concat(loopresponse);
                        return [3 /*break*/, 3];
                    case 5:
                        sheet = workbook.addWorksheet(tokensArray[i].symbol + '-' + expiries[i][0]);
                        sheet.getCell('B2').value = 'TOKEN';
                        sheet.getCell('B3').value = 'VENCIMIENTO';
                        sheet.getCell('B4').value = 'FECHA';
                        sheet.getCell('B2').font = { bold: true };
                        sheet.getCell('B3').font = { bold: true };
                        sheet.getCell('B4').font = { bold: true };
                        sheet.getCell('C2').value = tokensArray[i].symbol;
                        sheet.getCell('C3').value = expiries[i][0];
                        sheet.getCell('C4').value = getTime();
                        sheet.getCell('C6').value = 'HOLDERS';
                        sheet.getCell('C6').font = { bold: true };
                        rows = [];
                        namesAllowed = false;
                        if ((tokensArray[i].address == Constants.A.address) ||
                            (tokensArray[i].address == Constants.B.address) ||
                            (tokensArray[i].address == Constants.C.address) ||
                            (tokensArray[i].address == Constants.D.address) ||
                            (tokensArray[i].address == Constants.F.address)) {
                            namesAllowed = true;
                        }
                        for (j = 0; j < response.length; j++) {
                            array = [];
                            if ((!hideNames) || namesAllowed) {
                                if (response[j].wallet.name == null) {
                                    array.push("");
                                }
                                else {
                                    array.push(response[j].wallet.name.id);
                                }
                            }
                            array.push(response[j].wallet.id);
                            array.push(parseInt((0, utils_1.weiToEther)(response[j].balance)));
                            rows.push(array);
                        }
                        tableName = 'Tabla' + tokensArray[i].symbol + expiries[i][0];
                        if (!((hideNames) && !namesAllowed)) return [3 /*break*/, 7];
                        if (rows.length == 0)
                            rows.push(["", 0]);
                        return [4 /*yield*/, addTable(sheet, tableName, 'B7', [
                                { name: 'Wallet', filterButton: true },
                                { name: 'Saldo', totalsRowFunction: 'sum' }
                            ], rows)];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 7:
                        if (rows.length == 0)
                            rows.push(["", "", 0]);
                        return [4 /*yield*/, addTable(sheet, tableName, 'B7', [
                                { name: 'Nombre', filterButton: true },
                                { name: 'Wallet' },
                                { name: 'Saldo', totalsRowFunction: 'sum' }
                            ], rows)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        i++;
                        return [3 /*break*/, 1];
                    case 10:
                        _a.trys.push([10, 12, , 18]);
                        return [4 /*yield*/, workbook.xlsx.writeFile('PiMarketsPackableHoldersReport.xlsx')];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 18];
                    case 12:
                        error_7 = _a.sent();
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 13:
                        buffer = _a.sent();
                        _a.label = 14;
                    case 14:
                        _a.trys.push([14, 16, , 17]);
                        return [4 /*yield*/, FileSaver.saveAs(new Blob([buffer]), 'PiMarketsPackableHoldersReport.xlsx')];
                    case 15:
                        _a.sent();
                        return [3 /*break*/, 17];
                    case 16:
                        err_7 = _a.sent();
                        console.error(err_7);
                        return [3 /*break*/, 17];
                    case 17: return [3 /*break*/, 18];
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getCollectableHoldersReport = function (orderBy, orderDirection, tokensArray) {
        return __awaiter(this, void 0, void 0, function () {
            var first, skip, queryTemplates, workbook, i, response, loopresponse, sheet, rows, j, array, tableName, skipOffers, offers, loopOffers, rows2, k, array2, tableName2, error_8, buffer, err_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        first = 1000;
                        skip = 0;
                        queryTemplates = new graph_1.QueryTemplates(this.url);
                        workbook = new ExcelJS.Workbook();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < tokensArray.length)) return [3 /*break*/, 13];
                        return [4 /*yield*/, queryTemplates.getNFTHolders(orderBy, orderDirection, first, skip, tokensArray[i].address)];
                    case 2:
                        response = _a.sent();
                        loopresponse = response;
                        _a.label = 3;
                    case 3:
                        if (!(loopresponse.length >= 1000)) return [3 /*break*/, 5];
                        skip = response.length;
                        return [4 /*yield*/, queryTemplates.getNFTHolders(orderBy, orderDirection, first, skip, tokensArray[i].address)];
                    case 4:
                        response = _a.sent();
                        response = response.concat(loopresponse);
                        return [3 /*break*/, 3];
                    case 5:
                        sheet = workbook.addWorksheet(tokensArray[i].symbol);
                        sheet.getCell('B2').value = 'TOKEN';
                        sheet.getCell('B3').value = 'FECHA';
                        sheet.getCell('B2').font = { bold: true };
                        sheet.getCell('B3').font = { bold: true };
                        sheet.getCell('C2').value = tokensArray[i].symbol;
                        sheet.getCell('C3').value = getTime();
                        sheet.getCell('C6').value = 'HOLDERS';
                        sheet.getCell('C6').font = { bold: true };
                        rows = [];
                        for (j = 0; j < response.length; j++) {
                            array = [];
                            if (response[j].wallet.name == null) {
                                array.push("");
                            }
                            else {
                                array.push(response[j].wallet.name.id);
                            }
                            array.push(response[j].wallet.id);
                            array.push(parseFloat((0, utils_1.weiToEther)(response[j].balance)));
                            rows.push(array);
                        }
                        tableName = 'Tabla' + tokensArray[i].symbol;
                        return [4 /*yield*/, addTable(sheet, tableName, 'B7', [
                                { name: 'Nombre', filterButton: true },
                                { name: 'Wallet' },
                                { name: 'Saldo', totalsRowFunction: 'sum' }
                            ], rows)];
                    case 6:
                        _a.sent();
                        skipOffers = 0;
                        return [4 /*yield*/, queryTemplates.getNFTOffers('sellToken: "' + tokensArray[i].address + '", isOpen: true', 'timestamp', 'desc', 1000, skipOffers)];
                    case 7:
                        offers = _a.sent();
                        loopOffers = offers;
                        _a.label = 8;
                    case 8:
                        if (!(loopOffers.length >= 1000)) return [3 /*break*/, 10];
                        skipOffers = offers.length;
                        return [4 /*yield*/, queryTemplates.getNFTOffers('sellToken: "' + tokensArray[i].address + '", isOpen: true', 'timestamp', 'desc', 1000, skipOffers)];
                    case 9:
                        offers = _a.sent();
                        offers = offers.concat(loopOffers);
                        return [3 /*break*/, 8];
                    case 10:
                        if (!(offers.length > 0)) return [3 /*break*/, 12];
                        sheet.getCell('G6').value = 'OFERTAS P2P';
                        sheet.getCell('G6').font = { bold: true };
                        rows2 = [];
                        for (k = 0; k < offers.length; k++) {
                            array2 = [];
                            array2.push(offers[k].owner.name);
                            array2.push(offers[k].owner.id);
                            array2.push(parseInt((0, utils_1.weiToEther)(offers[k].sellAmount)));
                            rows2.push(array2);
                        }
                        tableName2 = 'P2P' + tokensArray[i].symbol;
                        return [4 /*yield*/, addTable(sheet, tableName2, 'F7', [
                                { name: 'Dueño de la oferta', filterButton: true },
                                { name: 'Wallet' },
                                { name: 'Cantidad ofertada', totalsRowFunction: 'sum' }
                            ], rows2)];
                    case 11:
                        _a.sent();
                        _a.label = 12;
                    case 12:
                        i++;
                        return [3 /*break*/, 1];
                    case 13:
                        _a.trys.push([13, 15, , 21]);
                        return [4 /*yield*/, workbook.xlsx.writeFile('PiMarketsCollectableHoldersReport.xlsx')];
                    case 14:
                        _a.sent();
                        return [3 /*break*/, 21];
                    case 15:
                        error_8 = _a.sent();
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 16:
                        buffer = _a.sent();
                        _a.label = 17;
                    case 17:
                        _a.trys.push([17, 19, , 20]);
                        return [4 /*yield*/, FileSaver.saveAs(new Blob([buffer]), 'PiMarketsCollectableHoldersReport.xlsx')];
                    case 18:
                        _a.sent();
                        return [3 /*break*/, 20];
                    case 19:
                        err_8 = _a.sent();
                        console.error(err_8);
                        return [3 /*break*/, 20];
                    case 20: return [3 /*break*/, 21];
                    case 21: return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getTokenDealsReportV2 = function (monthIndex, year, tokensArray, hideNames) {
        if (hideNames === void 0) { hideNames = true; }
        return __awaiter(this, void 0, void 0, function () {
            var workbook, toYear, toMonthIndex, timeLow, timeHigh, promises, i, sheet, sheet2, error_9, buffer, err_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workbook = new ExcelJS.Workbook();
                        toYear = year;
                        toMonthIndex = monthIndex + 1;
                        if (monthIndex == 12) {
                            toYear = year + 1;
                            toMonthIndex = 1;
                        }
                        timeLow = getUtcTimeFromDate(year, monthIndex, 1);
                        timeHigh = getUtcTimeFromDate(toYear, toMonthIndex, 1);
                        promises = [];
                        for (i = 0; i < tokensArray.length; i++) {
                            sheet = workbook.addWorksheet(tokensArray[i].symbol + '2°');
                            sheet2 = workbook.addWorksheet(tokensArray[i].symbol + '1°');
                            promises.push(setTokenDealsSheet(sheet, timeLow, timeHigh, monthIndex, year, toMonthIndex, toYear, this.url, tokensArray[i], hideNames));
                            promises.push(setPrimaryTokenDealsSheet(sheet2, timeLow, timeHigh, monthIndex, year, toMonthIndex, toYear, this.url, tokensArray[i], hideNames));
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 10]);
                        return [4 /*yield*/, workbook.xlsx.writeFile('PiMarketsTokenDealsReportV2.xlsx')];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 4:
                        error_9 = _a.sent();
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 5:
                        buffer = _a.sent();
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, FileSaver.saveAs(new Blob([buffer]), 'PiMarketsTokenDealsReportV2.xlsx')];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        err_9 = _a.sent();
                        console.error(err_9);
                        return [3 /*break*/, 9];
                    case 9: return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getTokenDealsReport = function (timeLow, timeHigh) {
        return __awaiter(this, void 0, void 0, function () {
            var workbook, sheet, deals, dealsPrimary, rows, nextDeal, nextDealTimestamp, nextDealPrimaryTimestamp, array, tableName, error_10, buffer, err_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workbook = new ExcelJS.Workbook();
                        sheet = workbook.addWorksheet('ALL_TOKEN_DEALS');
                        return [4 /*yield*/, getAllDeals(timeLow, timeHigh, this.url)];
                    case 1:
                        deals = _a.sent();
                        return [4 /*yield*/, getAllDealsPrimary(timeLow, timeHigh, this.url)];
                    case 2:
                        dealsPrimary = _a.sent();
                        rows = [];
                        while ((deals.length > 0) || (dealsPrimary.length > 0)) {
                            nextDealTimestamp = 0;
                            if (deals.length > 0) {
                                nextDealTimestamp = deals[deals.length - 1].timestamp;
                            }
                            nextDealPrimaryTimestamp = 0;
                            if (dealsPrimary.length > 0) {
                                nextDealPrimaryTimestamp = dealsPrimary[dealsPrimary.length - 1].timestamp;
                            }
                            if ((nextDealTimestamp != 0) && (nextDealPrimaryTimestamp != 0)) {
                                if (nextDealTimestamp < nextDealPrimaryTimestamp) {
                                    nextDeal = deals.pop();
                                }
                                else {
                                    nextDeal = dealsPrimary.pop();
                                }
                            }
                            else if (nextDealTimestamp == 0) {
                                nextDeal = dealsPrimary.pop();
                            }
                            else if (nextDealPrimaryTimestamp == 0) {
                                nextDeal = deals.pop();
                            }
                            array = [];
                            array.push(new Date(nextDeal.timestamp * 1000));
                            array.push(timeConverter(nextDeal.offer.timestamp));
                            array.push(timeConverter(nextDeal.timestamp));
                            array.push(nextDeal.offer.sellToken.tokenSymbol);
                            array.push(nextDeal.offer.buyToken.tokenSymbol);
                            if (nextDeal.seller.name == null) {
                                array.push("");
                            }
                            else {
                                array.push(nextDeal.seller.name);
                            }
                            if (nextDeal.buyer.name == null) {
                                array.push("");
                            }
                            else {
                                array.push(nextDeal.buyer.name);
                            }
                            array.push(parseFloat((0, utils_1.weiToEther)(nextDeal.sellAmount)));
                            array.push(parseFloat((0, utils_1.weiToEther)(nextDeal.buyAmount)));
                            rows.push(array);
                        }
                        tableName = 'Tabla';
                        return [4 /*yield*/, addTable(sheet, tableName, 'B3', [
                                { name: 'Fecha (pacto)', filterButton: true },
                                { name: 'Hora (oferta)' },
                                { name: 'Hora (pacto)' },
                                { name: 'Oferta', filterButton: true },
                                { name: 'Contrapartida', filterButton: true },
                                { name: 'Vendedor (usuario)', filterButton: true },
                                { name: 'Comprador (usuario)', filterButton: true },
                                { name: 'Monto pactado ', totalsRowFunction: 'sum' },
                                { name: 'Monto contrapartida', totalsRowFunction: 'sum' }
                            ], rows)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 12]);
                        return [4 /*yield*/, workbook.xlsx.writeFile('PiMarketsTokenDealsReport.xlsx')];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 6:
                        error_10 = _a.sent();
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 7:
                        buffer = _a.sent();
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, FileSaver.saveAs(new Blob([buffer]), 'PiMarketsTokenDealsReport.xlsx')];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        err_10 = _a.sent();
                        console.error(err_10);
                        return [3 /*break*/, 11];
                    case 11: return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getDealsReport = function (timeLow, timeHigh) {
        return __awaiter(this, void 0, void 0, function () {
            var workbook, sheet, deals, dealsPrimary, dealsPack, dealsPrimaryPack, rows, nextDeal, _array, nextDealTimestamp, nextDealPrimaryTimestamp, nextDealPackTimestamp, nextDealPrimaryPackTimestamp, index, min, i, array, tableName, error_11, buffer, err_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workbook = new ExcelJS.Workbook();
                        sheet = workbook.addWorksheet('ALL_DEALS');
                        return [4 /*yield*/, getAllDeals(timeLow, timeHigh, this.url)];
                    case 1:
                        deals = _a.sent();
                        return [4 /*yield*/, getAllDealsPrimary(timeLow, timeHigh, this.url)];
                    case 2:
                        dealsPrimary = _a.sent();
                        return [4 /*yield*/, getAllPackableDeals(timeLow, timeHigh, this.url)];
                    case 3:
                        dealsPack = _a.sent();
                        return [4 /*yield*/, getAllPackableDealPrimary(timeLow, timeHigh, this.url)];
                    case 4:
                        dealsPrimaryPack = _a.sent();
                        rows = [];
                        while ((deals.length > 0) || (dealsPrimary.length > 0) || (dealsPack.length > 0) || (dealsPrimaryPack.length > 0)) {
                            _array = [];
                            nextDealTimestamp = timeHigh;
                            if (deals.length > 0) {
                                nextDealTimestamp = deals[deals.length - 1].timestamp;
                            }
                            nextDealPrimaryTimestamp = timeHigh;
                            if (dealsPrimary.length > 0) {
                                nextDealPrimaryTimestamp = dealsPrimary[dealsPrimary.length - 1].timestamp;
                            }
                            nextDealPackTimestamp = timeHigh;
                            if (dealsPack.length > 0) {
                                nextDealPackTimestamp = dealsPack[dealsPack.length - 1].timestamp;
                            }
                            nextDealPrimaryPackTimestamp = timeHigh;
                            if (dealsPrimaryPack.length > 0) {
                                nextDealPrimaryPackTimestamp = dealsPrimaryPack[dealsPrimaryPack.length - 1].timestamp;
                            }
                            _array.push(nextDealTimestamp);
                            _array.push(nextDealPrimaryTimestamp);
                            _array.push(nextDealPackTimestamp);
                            _array.push(nextDealPrimaryPackTimestamp);
                            index = 0;
                            min = _array[0];
                            for (i = 1; i < _array.length; i++) {
                                if (_array[i] < min) {
                                    min = _array[i];
                                    index = i;
                                }
                            }
                            switch (index) {
                                case 0:
                                    nextDeal = deals.pop();
                                    break;
                                case 1:
                                    nextDeal = dealsPrimary.pop();
                                    break;
                                case 2:
                                    nextDeal = dealsPack.pop();
                                    break;
                                case 3:
                                    nextDeal = dealsPrimaryPack.pop();
                                    break;
                                default:
                                    break;
                            }
                            array = [];
                            array.push(new Date(nextDeal.timestamp * 1000));
                            array.push(timeConverter(nextDeal.offer.timestamp));
                            array.push(timeConverter(nextDeal.timestamp));
                            array.push(nextDeal.offer.sellToken.tokenSymbol);
                            array.push(nextDeal.offer.buyToken.tokenSymbol);
                            if (nextDeal.seller.name == null) {
                                array.push("");
                            }
                            else {
                                array.push(nextDeal.seller.name);
                            }
                            array.push(nextDeal.seller.id);
                            if (nextDeal.buyer.name == null) {
                                array.push("");
                            }
                            else {
                                array.push(nextDeal.buyer.name);
                            }
                            array.push(nextDeal.buyer.id);
                            array.push(parseFloat((0, utils_1.weiToEther)(nextDeal.sellAmount)));
                            array.push(parseFloat((0, utils_1.weiToEther)(nextDeal.buyAmount)));
                            rows.push(array);
                        }
                        tableName = 'Tabla';
                        return [4 /*yield*/, addTable(sheet, tableName, 'B3', [
                                { name: 'Fecha (pacto)', filterButton: true },
                                { name: 'Hora (oferta)' },
                                { name: 'Hora (pacto)' },
                                { name: 'Oferta', filterButton: true },
                                { name: 'Contrapartida', filterButton: true },
                                { name: 'Vendedor (usuario)', filterButton: true },
                                { name: 'Vendedor (wallet)', filterButton: true },
                                { name: 'Comprador (usuario)', filterButton: true },
                                { name: 'Comprador (wallet)', filterButton: true },
                                { name: 'Monto pactado ', totalsRowFunction: 'sum' },
                                { name: 'Monto contrapartida', totalsRowFunction: 'sum' }
                            ], rows)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 14]);
                        return [4 /*yield*/, workbook.xlsx.writeFile('PiMarketsDealsReport.xlsx')];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 8:
                        error_11 = _a.sent();
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 9:
                        buffer = _a.sent();
                        _a.label = 10;
                    case 10:
                        _a.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, FileSaver.saveAs(new Blob([buffer]), 'PiMarketsDealsReport.xlsx')];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        err_11 = _a.sent();
                        console.error(err_11);
                        return [3 /*break*/, 13];
                    case 13: return [3 /*break*/, 14];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getPackableDealsReportV2 = function (monthIndex, year, tokensArray, hideNames) {
        if (hideNames === void 0) { hideNames = true; }
        return __awaiter(this, void 0, void 0, function () {
            var workbook, toYear, toMonthIndex, timeLow, timeHigh, promises, i, sheet, sheet2, error_12, buffer, err_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workbook = new ExcelJS.Workbook();
                        toYear = year;
                        toMonthIndex = monthIndex + 1;
                        if (monthIndex == 12) {
                            toYear = year + 1;
                            toMonthIndex = 1;
                        }
                        timeLow = getUtcTimeFromDate(year, monthIndex, 1);
                        timeHigh = getUtcTimeFromDate(toYear, toMonthIndex, 1);
                        promises = [];
                        for (i = 0; i < tokensArray.length; i++) {
                            sheet = workbook.addWorksheet(tokensArray[i].symbol + '2°');
                            sheet2 = workbook.addWorksheet(tokensArray[i].symbol + '1°');
                            promises.push(setPackableDealsSheet(sheet, timeLow, timeHigh, this.url, tokensArray[i], hideNames));
                            promises.push(setPrimaryPackableDealsSheet(sheet2, timeLow, timeHigh, this.url, tokensArray[i], hideNames));
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 10]);
                        return [4 /*yield*/, workbook.xlsx.writeFile('PiMarketsPackableDealsReportV2.xlsx')];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 4:
                        error_12 = _a.sent();
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 5:
                        buffer = _a.sent();
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, FileSaver.saveAs(new Blob([buffer]), 'PiMarketsPackableDealsReportV2.xlsx')];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        err_12 = _a.sent();
                        console.error(err_12);
                        return [3 /*break*/, 9];
                    case 9: return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getPackableDealsReport = function (timeLow, timeHigh) {
        return __awaiter(this, void 0, void 0, function () {
            var workbook, sheet, deals, dealsPrimary, rows, nextDeal, nextDealTimestamp, nextDealPrimaryTimestamp, array, tableName, error_13, buffer, err_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workbook = new ExcelJS.Workbook();
                        sheet = workbook.addWorksheet('ALL_PACKABLE_DEALS');
                        return [4 /*yield*/, getAllPackableDeals(timeLow, timeHigh, this.url)];
                    case 1:
                        deals = _a.sent();
                        return [4 /*yield*/, getAllPackableDealPrimary(timeLow, timeHigh, this.url)];
                    case 2:
                        dealsPrimary = _a.sent();
                        rows = [];
                        while ((deals.length > 0) || (dealsPrimary.length > 0)) {
                            nextDealTimestamp = 0;
                            if (deals.length > 0) {
                                nextDealTimestamp = deals[deals.length - 1].timestamp;
                            }
                            nextDealPrimaryTimestamp = 0;
                            if (dealsPrimary.length > 0) {
                                nextDealPrimaryTimestamp = dealsPrimary[dealsPrimary.length - 1].timestamp;
                            }
                            if ((nextDealTimestamp != 0) && (nextDealPrimaryTimestamp != 0)) {
                                if (nextDealTimestamp < nextDealPrimaryTimestamp) {
                                    nextDeal = deals.pop();
                                }
                                else {
                                    nextDeal = dealsPrimary.pop();
                                }
                            }
                            else if (nextDealTimestamp == 0) {
                                nextDeal = dealsPrimary.pop();
                            }
                            else if (nextDealPrimaryTimestamp == 0) {
                                nextDeal = deals.pop();
                            }
                            array = [];
                            array.push(new Date(nextDeal.timestamp * 1000));
                            array.push(timeConverter(nextDeal.offer.timestamp));
                            array.push(timeConverter(nextDeal.timestamp));
                            array.push(nextDeal.offer.sellToken.tokenSymbol);
                            array.push(nextDeal.offer.buyToken.tokenSymbol);
                            if (nextDeal.seller.name == null) {
                                array.push("");
                            }
                            else {
                                array.push(nextDeal.seller.name);
                            }
                            if (nextDeal.buyer.name == null) {
                                array.push("");
                            }
                            else {
                                array.push(nextDeal.buyer.name);
                            }
                            array.push(parseInt((0, utils_1.weiToEther)(nextDeal.sellAmount)));
                            array.push(parseFloat((0, utils_1.weiToEther)(nextDeal.buyAmount)));
                            rows.push(array);
                        }
                        tableName = 'Tabla';
                        return [4 /*yield*/, addTable(sheet, tableName, 'B3', [
                                { name: 'Fecha (pacto)', filterButton: true },
                                { name: 'Hora (oferta)' },
                                { name: 'Hora (pacto)' },
                                { name: 'Oferta', filterButton: true },
                                { name: 'Contrapartida', filterButton: true },
                                { name: 'Vendedor (usuario)', filterButton: true },
                                { name: 'Comprador (usuario)', filterButton: true },
                                { name: 'Monto pactado ', totalsRowFunction: 'sum' },
                                { name: 'Monto contrapartida', totalsRowFunction: 'sum' }
                            ], rows)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 12]);
                        return [4 /*yield*/, workbook.xlsx.writeFile('PiMarketsPackableDealsReport.xlsx')];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 6:
                        error_13 = _a.sent();
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 7:
                        buffer = _a.sent();
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, FileSaver.saveAs(new Blob([buffer]), 'PiMarketsPackableDealsReport.xlsx')];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        err_13 = _a.sent();
                        console.error(err_13);
                        return [3 /*break*/, 11];
                    case 11: return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getUserDealsReport = function (wallet, monthIndex, year) {
        return __awaiter(this, void 0, void 0, function () {
            var toYear, toMonthIndex, timeLow, timeHigh;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        toYear = year;
                        toMonthIndex = monthIndex + 1;
                        if (monthIndex == 12) {
                            toYear = year + 1;
                            toMonthIndex = 1;
                        }
                        timeLow = getUtcTimeFromDate(year, monthIndex, 1);
                        timeHigh = getUtcTimeFromDate(toYear, toMonthIndex, 1);
                        return [4 /*yield*/, this.getUserDealsReportByTime(wallet, timeLow, timeHigh)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getUserDealsReportByTime = function (wallet, timeLow, timeHigh, dex) {
        if (dex === void 0) { dex = "dex"; }
        return __awaiter(this, void 0, void 0, function () {
            var workbook, generalSheet, dealSheet, dexSheet, txSheet, queryTemplates, nickname, deals, dealsPack, dealsPrimary, dealsPrimaryPack, txs, totalUsd, totalDeals, dealRows, nextDeal, _array, nextDealTimestamp, nextDealPrimaryTimestamp, nextDealPackTimestamp, nextDealPrimaryPackTimestamp, index, min, i, array_1, usdAmount, tableName_1, dexDeals, nextDexDeal, dealsRow, i, dealRow, baseToken, baseAmount, usdAmount, array, rows, tableNameGeneral, bc, firstBlockNumber, lastBlockNumber, prevTx, _a, txHash, logIndex, tx, _b, txHashFirst, logIndexFirst, txFirst, _c, txHashLast, logIndexLast, txLast, balancesFirst, balancesLast, txRows, j, array_2, usdAmount, tableName_2, tableName, error_14, buffer, err_14;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        workbook = new ExcelJS.Workbook();
                        generalSheet = workbook.addWorksheet('Resumen');
                        dealSheet = workbook.addWorksheet('P2P');
                        dexSheet = workbook.addWorksheet('DEX');
                        txSheet = workbook.addWorksheet('Transferencias');
                        queryTemplates = new graph_1.QueryTemplates(this.url);
                        return [4 /*yield*/, queryTemplates.getNameByWallet(wallet)];
                    case 1:
                        nickname = _d.sent();
                        return [4 /*yield*/, getUserAllDeals(nickname, timeLow, timeHigh, this.url)];
                    case 2:
                        deals = _d.sent();
                        return [4 /*yield*/, getUserPackableAllDeals(nickname, timeLow, timeHigh, this.url)];
                    case 3:
                        dealsPack = _d.sent();
                        return [4 /*yield*/, getUserAllDealsPrimary(nickname, timeLow, timeHigh, this.url)];
                    case 4:
                        dealsPrimary = _d.sent();
                        return [4 /*yield*/, getUserPackableAllDealsPrimary(nickname, timeLow, timeHigh, this.url)];
                    case 5:
                        dealsPrimaryPack = _d.sent();
                        return [4 /*yield*/, getAllTransactionsByName(timeLow, timeHigh, nickname, this.url)];
                    case 6:
                        txs = _d.sent();
                        totalUsd = 0;
                        totalDeals = 0;
                        dealRows = [];
                        _d.label = 7;
                    case 7:
                        if (!((deals.length > 0) || (dealsPrimary.length > 0) || (dealsPack.length > 0) || (dealsPrimaryPack.length > 0))) return [3 /*break*/, 11];
                        _array = [];
                        nextDealTimestamp = timeHigh;
                        if (deals.length > 0) {
                            nextDealTimestamp = deals[deals.length - 1].timestamp;
                        }
                        nextDealPrimaryTimestamp = timeHigh;
                        if (dealsPrimary.length > 0) {
                            nextDealPrimaryTimestamp = dealsPrimary[dealsPrimary.length - 1].timestamp;
                        }
                        nextDealPackTimestamp = timeHigh;
                        if (dealsPack.length > 0) {
                            nextDealPackTimestamp = dealsPack[dealsPack.length - 1].timestamp;
                        }
                        nextDealPrimaryPackTimestamp = timeHigh;
                        if (dealsPrimaryPack.length > 0) {
                            nextDealPrimaryPackTimestamp = dealsPrimaryPack[dealsPrimaryPack.length - 1].timestamp;
                        }
                        _array.push(nextDealTimestamp);
                        _array.push(nextDealPrimaryTimestamp);
                        _array.push(nextDealPackTimestamp);
                        _array.push(nextDealPrimaryPackTimestamp);
                        index = 0;
                        min = _array[0];
                        for (i = 1; i < _array.length; i++) {
                            if (_array[i] < min) {
                                min = _array[i];
                                index = i;
                            }
                        }
                        switch (index) {
                            case 0:
                                nextDeal = deals.pop();
                                break;
                            case 1:
                                nextDeal = dealsPrimary.pop();
                                break;
                            case 2:
                                nextDeal = dealsPack.pop();
                                break;
                            case 3:
                                nextDeal = dealsPrimaryPack.pop();
                                break;
                            default:
                                break;
                        }
                        array_1 = [];
                        array_1.push(new Date(nextDeal.timestamp * 1000));
                        array_1.push(timeConverter(nextDeal.offer.timestamp));
                        array_1.push(timeConverter(nextDeal.timestamp));
                        array_1.push(nextDeal.offer.sellToken.tokenSymbol);
                        array_1.push(nextDeal.offer.buyToken.tokenSymbol);
                        if (nextDeal.seller.name == null) {
                            array_1.push("");
                        }
                        else {
                            array_1.push(nextDeal.seller.name);
                        }
                        array_1.push(nextDeal.seller.id);
                        if (nextDeal.buyer.name == null) {
                            array_1.push("");
                        }
                        else {
                            array_1.push(nextDeal.buyer.name);
                        }
                        array_1.push(nextDeal.buyer.id);
                        array_1.push(parseFloat((0, utils_1.weiToEther)(nextDeal.sellAmount)));
                        array_1.push(parseFloat((0, utils_1.weiToEther)(nextDeal.buyAmount)));
                        usdAmount = 0;
                        if (!((nextDeal.offer.buyToken.id == Constants.USD.address) ||
                            (nextDeal.offer.buyToken.id == Constants.USC.address) ||
                            (nextDeal.offer.buyToken.id == Constants.PEL.address))) return [3 /*break*/, 8];
                        usdAmount = parseFloat((0, utils_1.weiToEther)(nextDeal.buyAmount));
                        return [3 /*break*/, 10];
                    case 8: return [4 /*yield*/, convertToUsd(parseFloat((0, utils_1.weiToEther)(nextDeal.buyAmount)), nextDeal.offer.buyToken.id, nextDeal.timestamp)];
                    case 9:
                        usdAmount = _d.sent();
                        _d.label = 10;
                    case 10:
                        array_1.push(usdAmount);
                        totalUsd = +totalUsd + +usdAmount;
                        totalDeals++;
                        dealRows.push(array_1);
                        return [3 /*break*/, 7];
                    case 11:
                        if (dealRows.length > 0) {
                            dealSheet.getCell('B2').value = 'PACTOS';
                            dealSheet.getCell('B2').font = { bold: true };
                            tableName_1 = 'Month_Deals';
                            addTable(dealSheet, tableName_1, 'B4', [
                                { name: 'Fecha (pacto)', filterButton: true },
                                { name: 'Hora (oferta)' },
                                { name: 'Hora (pacto)' },
                                { name: 'Oferta', filterButton: true },
                                { name: 'Contrapartida', filterButton: true },
                                { name: 'Vendedor (usuario)', filterButton: true },
                                { name: 'Vendedor (wallet)', filterButton: true },
                                { name: 'Comprador (usuario)', filterButton: true },
                                { name: 'Comprador (wallet)', filterButton: true },
                                { name: 'Monto pactado' },
                                { name: 'Monto contrapartida' },
                                { name: 'Monto contrapartida (USD)', totalsRowFunction: 'sum' }
                            ], dealRows);
                        }
                        else {
                            dealSheet.getCell('B2').value = 'NO HAY PACTOS';
                            dealSheet.getCell('B2').font = { bold: true };
                        }
                        return [4 /*yield*/, getDexDealsByWallet(timeLow, timeHigh, wallet, dex, this.url)];
                    case 12:
                        dexDeals = _d.sent();
                        dealsRow = [];
                        i = 0;
                        _d.label = 13;
                    case 13:
                        if (!(i < dexDeals.length)) return [3 /*break*/, 18];
                        nextDexDeal = dexDeals[i];
                        dealRow = [];
                        baseToken = void 0;
                        baseAmount = void 0;
                        dealRow.push(new Date(nextDexDeal.timestamp * 1000));
                        if (nextDexDeal.side == "1") {
                            //amountA is in nominatorToken
                            //amountB is in baseToken (PEL)
                            //orderA-SELL & orderB-BUY
                            baseToken = nextDexDeal.tokenA.id;
                            baseAmount = nextDexDeal.amountB;
                            dealRow.push(nextDexDeal.tokenB.tokenSymbol + "_" + nextDexDeal.tokenA.tokenSymbol);
                            if (nextDexDeal.orderB.owner.id == wallet) {
                                dealRow.push("COMPRA");
                            }
                            else if (nextDexDeal.orderA.owner.id) {
                                dealRow.push("VENTA");
                            }
                            //PRICE
                            dealRow.push(parseFloat((0, utils_1.weiToEther)(nextDexDeal.price)));
                            //AMOUNT (in nominatorToken)
                            dealRow.push(parseFloat((0, utils_1.weiToEther)(nextDexDeal.amountA)));
                            //AMOUNT (in baseToken aka PEL)
                            dealRow.push(parseFloat((0, utils_1.weiToEther)(nextDexDeal.amountB)));
                        }
                        else {
                            //amountA is in baseToken (PEL)
                            //amountB is in nominatorToken
                            //orderA-BUY & orderB-SELL
                            baseToken = nextDexDeal.tokenB.id;
                            baseAmount = nextDexDeal.amountA;
                            dealRow.push(nextDexDeal.tokenA.tokenSymbol + "_" + nextDexDeal.tokenB.tokenSymbol);
                            if (nextDexDeal.orderA.owner.id == wallet) {
                                dealRow.push("COMPRA");
                            }
                            else if (nextDexDeal.orderB.owner.id) {
                                dealRow.push("VENTA");
                            }
                            //PRICE
                            dealRow.push(parseFloat((0, utils_1.weiToEther)(nextDexDeal.price)));
                            //AMOUNT (in nominatorToken)
                            dealRow.push(parseFloat((0, utils_1.weiToEther)(nextDexDeal.amountB)));
                            //AMOUNT (in baseToken aka PEL)
                            dealRow.push(parseFloat((0, utils_1.weiToEther)(nextDexDeal.amountA)));
                        }
                        usdAmount = 0;
                        if (!((baseToken == Constants.USD.address) ||
                            (baseToken == Constants.USC.address) ||
                            (baseToken == Constants.PEL.address))) return [3 /*break*/, 14];
                        usdAmount = parseFloat((0, utils_1.weiToEther)(baseAmount));
                        return [3 /*break*/, 16];
                    case 14: return [4 /*yield*/, convertToUsd(parseFloat((0, utils_1.weiToEther)(baseAmount)), baseToken, nextDexDeal.timestamp)];
                    case 15:
                        usdAmount = _d.sent();
                        _d.label = 16;
                    case 16:
                        dealRow.push(usdAmount);
                        dealsRow.push(dealRow);
                        totalUsd = +totalUsd + +usdAmount;
                        totalDeals++;
                        _d.label = 17;
                    case 17:
                        i++;
                        return [3 /*break*/, 13];
                    case 18:
                        array = [];
                        rows = [];
                        generalSheet.getCell('B2').value = 'RESUMEN: ' + (new Date(timeLow * 1000)).toUTCString() + ' <--> ' + (new Date(timeHigh * 1000)).toUTCString();
                        generalSheet.getCell('B2').font = { bold: true };
                        array.push(nickname);
                        array.push(totalUsd);
                        array.push(totalDeals);
                        rows.push(array);
                        tableNameGeneral = 'General';
                        addTable(generalSheet, tableNameGeneral, 'B4', [
                            { name: 'Usuario' },
                            { name: 'Total pactado (USD)' },
                            { name: 'Número total de pactos' }
                        ], rows);
                        bc = new blockchain_1.Blockchain(this.url);
                        firstBlockNumber = 0;
                        lastBlockNumber = 0;
                        if (!(txs.length == 0)) return [3 /*break*/, 24];
                        return [4 /*yield*/, getUserLastTxBeforeTime(nickname, timeLow, this.url)];
                    case 19:
                        prevTx = _d.sent();
                        if (!(prevTx != null)) return [3 /*break*/, 21];
                        _a = String(prevTx).split('-'), txHash = _a[0], logIndex = _a[1];
                        return [4 /*yield*/, bc.getTransaction(txHash)];
                    case 20:
                        tx = _d.sent();
                        firstBlockNumber = tx.blockNumber;
                        firstBlockNumber = firstBlockNumber + 1;
                        lastBlockNumber = firstBlockNumber;
                        return [3 /*break*/, 23];
                    case 21: return [4 /*yield*/, bc.getBlockNumber()];
                    case 22:
                        firstBlockNumber = _d.sent();
                        firstBlockNumber = firstBlockNumber - 5;
                        lastBlockNumber = firstBlockNumber;
                        _d.label = 23;
                    case 23: return [3 /*break*/, 27];
                    case 24:
                        _b = String(txs[txs.length - 1].id).split('-'), txHashFirst = _b[0], logIndexFirst = _b[1];
                        return [4 /*yield*/, bc.getTransaction(txHashFirst)];
                    case 25:
                        txFirst = _d.sent();
                        firstBlockNumber = txFirst.blockNumber;
                        firstBlockNumber = firstBlockNumber + 1;
                        _c = String(txs[0].id).split('-'), txHashLast = _c[0], logIndexLast = _c[1];
                        return [4 /*yield*/, bc.getTransaction(txHashLast)];
                    case 26:
                        txLast = _d.sent();
                        lastBlockNumber = txLast.blockNumber;
                        lastBlockNumber = lastBlockNumber + 1;
                        _d.label = 27;
                    case 27: return [4 /*yield*/, getUserBalances(nickname, firstBlockNumber, this.url)];
                    case 28:
                        balancesFirst = _d.sent();
                        return [4 /*yield*/, getUserBalances(nickname, lastBlockNumber, this.url)];
                    case 29:
                        balancesLast = _d.sent();
                        setBalancesTable(generalSheet, balancesFirst, 'Balances_Init', 'B9');
                        setBalancesTable(generalSheet, balancesLast, 'Balances_Last', 'E9');
                        generalSheet.getCell('B8').value = 'Fecha de inicio';
                        generalSheet.getCell('B8').font = { bold: true };
                        generalSheet.getCell('E8').value = 'Final final';
                        generalSheet.getCell('E8').font = { bold: true };
                        if (!(txs.length > 0)) return [3 /*break*/, 34];
                        txRows = [];
                        j = 0;
                        _d.label = 30;
                    case 30:
                        if (!(j < txs.length)) return [3 /*break*/, 33];
                        array_2 = [];
                        array_2.push(new Date(txs[j].timestamp * 1000));
                        array_2.push(txs[j].currency.tokenSymbol);
                        array_2.push(txs[j].from.id);
                        if (txs[j].from.name == null) {
                            array_2.push("");
                        }
                        else {
                            array_2.push(txs[j].from.name.id);
                        }
                        array_2.push(txs[j].to.id);
                        if (txs[j].to.name == null) {
                            array_2.push("");
                        }
                        else {
                            array_2.push(txs[j].to.name.id);
                        }
                        array_2.push(parseFloat((0, utils_1.weiToEther)(txs[j].amount)));
                        return [4 /*yield*/, convertToUsd(parseFloat((0, utils_1.weiToEther)(txs[j].amount)), txs[j].currency.id, txs[j].timestamp)];
                    case 31:
                        usdAmount = _d.sent();
                        array_2.push(usdAmount);
                        txRows.push(array_2);
                        _d.label = 32;
                    case 32:
                        j++;
                        return [3 /*break*/, 30];
                    case 33:
                        if (txRows.length > 0) {
                            txSheet.getCell('B2').value = 'TRANSFERENCIAS';
                            txSheet.getCell('B2').font = { bold: true };
                            tableName_2 = 'Month_TXs';
                            addTable(txSheet, tableName_2, 'B4', [
                                { name: 'Fecha', filterButton: true },
                                { name: 'Divisa' },
                                { name: 'Origen (wallet)' },
                                { name: 'Origen (usuario)', filterButton: true },
                                { name: 'Destino (wallet)' },
                                { name: 'Destino (usuario)', filterButton: true },
                                { name: 'Monto' },
                                { name: 'Monto (USD)' }
                            ], txRows);
                        }
                        return [3 /*break*/, 35];
                    case 34:
                        txSheet.getCell('B2').value = 'NO HAY TRANSFERENCIAS';
                        txSheet.getCell('B2').font = { bold: true };
                        _d.label = 35;
                    case 35:
                        tableName = 'DexDeals';
                        if (dealsRow.length == 0) {
                            dealsRow = [[new Date(), "", "", 0, 0, 0]];
                        }
                        addTable(dexSheet, tableName, 'B2', [
                            { name: 'Fecha', filterButton: true },
                            { name: 'Par', filterButton: true },
                            { name: 'Compra/Venta', filterButton: true },
                            { name: 'Precio', totalsRowFunction: 'average' },
                            { name: 'Cantidad', totalsRowFunction: 'sum' },
                            { name: 'Cantidad (contrapartida)', totalsRowFunction: 'sum' },
                            { name: 'Cantidad (USD)', totalsRowFunction: 'sum' }
                        ], dealsRow);
                        _d.label = 36;
                    case 36:
                        _d.trys.push([36, 38, , 44]);
                        return [4 /*yield*/, workbook.xlsx.writeFile('PiMarketsUserReport.xlsx')];
                    case 37:
                        _d.sent();
                        return [3 /*break*/, 44];
                    case 38:
                        error_14 = _d.sent();
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 39:
                        buffer = _d.sent();
                        _d.label = 40;
                    case 40:
                        _d.trys.push([40, 42, , 43]);
                        return [4 /*yield*/, FileSaver.saveAs(new Blob([buffer]), 'PiMarketsUserReport.xlsx')];
                    case 41:
                        _d.sent();
                        return [3 /*break*/, 43];
                    case 42:
                        err_14 = _d.sent();
                        console.error(err_14);
                        return [3 /*break*/, 43];
                    case 43: return [3 /*break*/, 44];
                    case 44: return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getUsersReport = function (monthIndex, year, authToken) {
        return __awaiter(this, void 0, void 0, function () {
            var ratesObj, workbook, sheet, toYear, toMonthIndex, timeLow, timeHigh, queryTemplates, response, identities, inputsObj, inputsAmountObj, outputsObj, outputsAmountObj, totalObj, maxObj, kycAmountsObj, flagsObj, identitiesArray, k, identity, txs, m, tx, txAmount, from, to, names, namesQuery, walletsArray, p, usersKyc, tableArray, _loop_1, n, error_15, buffer, err_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ratesObj = {};
                        workbook = new ExcelJS.Workbook();
                        sheet = workbook.addWorksheet('SmartID_Report');
                        toYear = year;
                        toMonthIndex = monthIndex + 1;
                        if (monthIndex == 12) {
                            toYear = year + 1;
                            toMonthIndex = 1;
                        }
                        timeLow = getUtcTimeFromDate(year, monthIndex, 1);
                        timeHigh = getUtcTimeFromDate(toYear, toMonthIndex, 1);
                        queryTemplates = new graph_1.QueryTemplates(this.url);
                        return [4 /*yield*/, queryTemplates.getSmartIDs(0)];
                    case 1:
                        response = _a.sent();
                        identities = response;
                        _a.label = 2;
                    case 2:
                        if (!(response.length >= 1000)) return [3 /*break*/, 4];
                        return [4 /*yield*/, queryTemplates.getSmartIDs(identities.length)];
                    case 3:
                        response = _a.sent();
                        identities = identities.concat(response);
                        return [3 /*break*/, 2];
                    case 4:
                        inputsObj = {};
                        inputsAmountObj = {};
                        outputsObj = {};
                        outputsAmountObj = {};
                        totalObj = {};
                        maxObj = {};
                        kycAmountsObj = {};
                        flagsObj = {};
                        identitiesArray = [];
                        for (k = 0; k < identities.length; k++) {
                            identity = String(identities[k].identity).toLowerCase();
                            inputsObj[identity] = 0;
                            inputsAmountObj[identity] = 0;
                            outputsObj[identity] = 0;
                            outputsAmountObj[identity] = 0;
                            totalObj[identity] = 0;
                            maxObj[identity] = 0;
                            kycAmountsObj[identity] = 0;
                            flagsObj[identity] = 0;
                            identitiesArray.push(identity);
                        }
                        return [4 /*yield*/, getAllTransactions(timeLow, timeHigh, this.url)];
                    case 5:
                        txs = _a.sent();
                        m = 0;
                        _a.label = 6;
                    case 6:
                        if (!(m < txs.length)) return [3 /*break*/, 9];
                        tx = txs[m];
                        return [4 /*yield*/, convertToUsdFromObj(parseFloat((0, utils_1.weiToEther)(tx.amount)), tx.currency.id, parseInt(tx.currency.tokenKind), tx.timestamp, ratesObj)];
                    case 7:
                        txAmount = _a.sent();
                        if (tx.from.identity != null) {
                            from = String(tx.from.identity.id).toLowerCase();
                            if (identitiesArray.includes(from)) {
                                outputsObj[from]++;
                                outputsAmountObj[from] = outputsAmountObj[from] + txAmount;
                                if (txAmount > Math.abs(maxObj[from])) {
                                    maxObj[from] = txAmount * (-1);
                                }
                            }
                        }
                        if (tx.to.identity != null) {
                            to = String(tx.to.identity.id).toLowerCase();
                            if (identitiesArray.includes(to)) {
                                inputsObj[to]++;
                                inputsAmountObj[to] = inputsAmountObj[to] + txAmount;
                                if (txAmount > Math.abs(maxObj[to])) {
                                    maxObj[to] = txAmount;
                                }
                            }
                        }
                        _a.label = 8;
                    case 8:
                        m++;
                        return [3 /*break*/, 6];
                    case 9:
                        names = [];
                        return [4 /*yield*/, queryTemplates.getNamesByIdentityArray(identitiesArray, names.length)];
                    case 10:
                        namesQuery = _a.sent();
                        names = namesQuery;
                        _a.label = 11;
                    case 11:
                        if (!(namesQuery.length > 1000)) return [3 /*break*/, 13];
                        return [4 /*yield*/, queryTemplates.getNamesByIdentityArray(identitiesArray, names.length)];
                    case 12:
                        namesQuery = _a.sent();
                        names = names.concat(namesQuery);
                        return [3 /*break*/, 11];
                    case 13:
                        walletsArray = [];
                        for (p = 0; p < names.length; p++) {
                            walletsArray.push(String(names[p].wallet.id).toLowerCase());
                        }
                        return [4 /*yield*/, getUsersDataProtected(walletsArray, authToken)];
                    case 14:
                        usersKyc = _a.sent();
                        tableArray = [];
                        _loop_1 = function (n) {
                            var array = [];
                            var id = names[n];
                            var pibid = String(id.id).toLowerCase();
                            var total = inputsAmountObj[pibid] - outputsAmountObj[pibid];
                            var userKyc = usersKyc.filter(function (obj) {
                                return obj.nickname == id.wallet.name.id;
                            });
                            var kycAmount = void 0;
                            var topLimit = 0;
                            var monthly_income = "ERROR";
                            if (userKyc[0] != undefined) {
                                if (userKyc[0].user_data != undefined) {
                                    kycAmount = userKyc[0].user_data.monthly_income;
                                    switch (kycAmount) {
                                        case 500:
                                            topLimit = 600;
                                            monthly_income = "Menos de 500 €";
                                            break;
                                        case 1000:
                                            topLimit = 1800;
                                            monthly_income = "Entre 500 y 1.500 €";
                                            break;
                                        case 2000:
                                            topLimit = 3000;
                                            monthly_income = "Entre 1.500 y 2.500 €";
                                            break;
                                        case 3250:
                                            topLimit = 4800;
                                            monthly_income = "Entre 2.500 y 4.000 €";
                                            break;
                                        case 5000:
                                            topLimit = 7200;
                                            monthly_income = "Entre 4.000 y 6.000 €";
                                            break;
                                        case 8000:
                                            topLimit = 12000;
                                            monthly_income = "Entre 6.000 y 10.000 €";
                                            break;
                                        case 10000:
                                            topLimit = 120000;
                                            monthly_income = "Más de 10.000 €";
                                            break;
                                        default:
                                            topLimit = 0;
                                            monthly_income = "ERROR";
                                            break;
                                    }
                                }
                                else {
                                    topLimit = 0;
                                    monthly_income = "ERROR";
                                }
                            }
                            else {
                                topLimit = 0;
                                monthly_income = "ERROR";
                            }
                            var flag = 0;
                            if (Math.abs(maxObj[pibid]) > topLimit) {
                                flag = 1;
                            }
                            if ((topLimit == 0) && (monthly_income == "ERROR")) {
                                flag = 1;
                            }
                            array.push(id.wallet.name.id);
                            array.push(inputsObj[pibid]);
                            array.push(inputsAmountObj[pibid]);
                            array.push(outputsObj[pibid]);
                            array.push(outputsAmountObj[pibid]);
                            array.push(total);
                            array.push(maxObj[pibid]);
                            array.push(monthly_income);
                            array.push(flag);
                            tableArray.push(array);
                        };
                        for (n = 0; n < names.length; n++) {
                            _loop_1(n);
                        }
                        addTable(sheet, 'SmartIDReportTable', 'B2', [
                            { name: 'Nombre', filterButton: true },
                            { name: 'N Entradas' },
                            { name: 'Entradas (USD)' },
                            { name: 'N Salidas' },
                            { name: 'Salidas (USD)' },
                            { name: 'Total (USD)' },
                            { name: 'Max (USD)', filterButton: true },
                            { name: 'Declarado (USD)', filterButton: true },
                            { name: 'Alerta', filterButton: true }
                        ], tableArray);
                        _a.label = 15;
                    case 15:
                        _a.trys.push([15, 17, , 23]);
                        return [4 /*yield*/, workbook.xlsx.writeFile('PiMarketsSmartIDReport.xlsx')];
                    case 16:
                        _a.sent();
                        return [3 /*break*/, 23];
                    case 17:
                        error_15 = _a.sent();
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 18:
                        buffer = _a.sent();
                        _a.label = 19;
                    case 19:
                        _a.trys.push([19, 21, , 22]);
                        return [4 /*yield*/, FileSaver.saveAs(new Blob([buffer]), 'PiMarketsSmartIDReport.xlsx')];
                    case 20:
                        _a.sent();
                        return [3 /*break*/, 22];
                    case 21:
                        err_15 = _a.sent();
                        console.error(err_15);
                        return [3 /*break*/, 22];
                    case 22: return [3 /*break*/, 23];
                    case 23: return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getTransactionsData = function (timeLow, timeHigh, token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getTransactions(timeLow, timeHigh, token.address, this.url)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Report.prototype.getDealsData = function (timeLow, timeHigh, token, market) {
        if (market === void 0) { market = "secondary"; }
        return __awaiter(this, void 0, void 0, function () {
            var offers, requests;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        offers = [];
                        requests = [];
                        if (!(token.category == 1)) return [3 /*break*/, 7];
                        if (!(market == "secondary")) return [3 /*break*/, 3];
                        return [4 /*yield*/, getOffers(timeLow, timeHigh, token.address, this.url)];
                    case 1:
                        offers = _a.sent();
                        return [4 /*yield*/, getRequests(timeLow, timeHigh, token.address, this.url)];
                    case 2:
                        requests = _a.sent();
                        return [3 /*break*/, 6];
                    case 3:
                        if (!(market == "primary")) return [3 /*break*/, 6];
                        return [4 /*yield*/, getOffersPrimary(timeLow, timeHigh, token.address, this.url)];
                    case 4:
                        offers = _a.sent();
                        return [4 /*yield*/, getRequestsPrimary(timeLow, timeHigh, token.address, this.url)];
                    case 5:
                        requests = _a.sent();
                        _a.label = 6;
                    case 6: return [3 /*break*/, 18];
                    case 7:
                        if (!(token.category == 2)) return [3 /*break*/, 12];
                        if (!(market == "secondary")) return [3 /*break*/, 9];
                        return [4 /*yield*/, getCollectableOffers(timeLow, timeHigh, token.address, this.url)];
                    case 8:
                        offers = _a.sent();
                        return [3 /*break*/, 11];
                    case 9:
                        if (!(market == "primary")) return [3 /*break*/, 11];
                        return [4 /*yield*/, getCollectableOffersPrimary(timeLow, timeHigh, token.address, this.url)];
                    case 10:
                        offers = _a.sent();
                        _a.label = 11;
                    case 11: return [3 /*break*/, 18];
                    case 12:
                        if (!(token.category == 3)) return [3 /*break*/, 18];
                        if (!(market == "secondary")) return [3 /*break*/, 15];
                        return [4 /*yield*/, getPackableOffers(timeLow, timeHigh, token.address, this.url)];
                    case 13:
                        offers = _a.sent();
                        return [4 /*yield*/, getPackableRequests(timeLow, timeHigh, token.address, this.url)];
                    case 14:
                        requests = _a.sent();
                        return [3 /*break*/, 18];
                    case 15:
                        if (!(market == "primary")) return [3 /*break*/, 18];
                        return [4 /*yield*/, getPackableOffersPrimary(timeLow, timeHigh, token.address, this.url)];
                    case 16:
                        offers = _a.sent();
                        return [4 /*yield*/, getPackableRequestsPrimary(timeLow, timeHigh, token.address, this.url)];
                    case 17:
                        requests = _a.sent();
                        _a.label = 18;
                    case 18:
                        offers = cleanEmptyDeals(offers);
                        requests = cleanEmptyDeals(requests);
                        return [2 /*return*/, new DealsReportData(token.address, token.symbol, offers, requests)];
                }
            });
        });
    };
    Report.prototype.getHoldersData = function (token, expiry) {
        return __awaiter(this, void 0, void 0, function () {
            var first, orderBy, orderDirection, queryTemplates, skip, holders, offers, loopresponse, skipOffers, loopOffers, loopresponse, skipOffers, loopOffers, loopresponse, skipOffers, loopOffers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        first = 1000;
                        orderBy = "balance";
                        orderDirection = "desc";
                        queryTemplates = new graph_1.QueryTemplates(this.url);
                        skip = 0;
                        holders = [];
                        offers = [];
                        if (!(token.category == 1)) return [3 /*break*/, 9];
                        return [4 /*yield*/, queryTemplates.getTokenHolders(orderBy, orderDirection, first, skip, token.address)];
                    case 1:
                        holders = _a.sent();
                        loopresponse = holders;
                        _a.label = 2;
                    case 2:
                        if (!(loopresponse.length >= 1000)) return [3 /*break*/, 4];
                        skip = holders.length;
                        return [4 /*yield*/, queryTemplates.getTokenHolders(orderBy, orderDirection, first, skip, token.address)];
                    case 3:
                        holders = _a.sent();
                        holders = holders.concat(loopresponse);
                        return [3 /*break*/, 2];
                    case 4:
                        skipOffers = 0;
                        return [4 /*yield*/, queryTemplates.getOffers('sellToken: "' + token.address + '", isOpen: true', 'sellAmount', 'desc', 1000, skipOffers)];
                    case 5:
                        offers = _a.sent();
                        loopOffers = offers;
                        _a.label = 6;
                    case 6:
                        if (!(loopOffers.length >= 1000)) return [3 /*break*/, 8];
                        skipOffers = offers.length;
                        return [4 /*yield*/, queryTemplates.getOffers('sellToken: "' + token.address + '", isOpen: true', 'sellAmount', 'desc', 1000, skipOffers)];
                    case 7:
                        offers = _a.sent();
                        offers = offers.concat(loopOffers);
                        return [3 /*break*/, 6];
                    case 8: return [3 /*break*/, 26];
                    case 9:
                        if (!(token.category == 2)) return [3 /*break*/, 18];
                        return [4 /*yield*/, queryTemplates.getNFTHolders(orderBy, orderDirection, first, skip, token.address)];
                    case 10:
                        holders = _a.sent();
                        loopresponse = holders;
                        _a.label = 11;
                    case 11:
                        if (!(loopresponse.length >= 1000)) return [3 /*break*/, 13];
                        skip = holders.length;
                        return [4 /*yield*/, queryTemplates.getNFTHolders(orderBy, orderDirection, first, skip, token.address)];
                    case 12:
                        holders = _a.sent();
                        holders = holders.concat(loopresponse);
                        return [3 /*break*/, 11];
                    case 13:
                        skipOffers = 0;
                        return [4 /*yield*/, queryTemplates.getNFTOffers('sellToken: "' + token.address + '", isOpen: true', 'sellAmount', 'desc', 1000, skipOffers)];
                    case 14:
                        offers = _a.sent();
                        loopOffers = offers;
                        _a.label = 15;
                    case 15:
                        if (!(loopOffers.length >= 1000)) return [3 /*break*/, 17];
                        skipOffers = offers.length;
                        return [4 /*yield*/, queryTemplates.getNFTOffers('sellToken: "' + token.address + '", isOpen: true', 'sellAmount', 'desc', 1000, skipOffers)];
                    case 16:
                        offers = _a.sent();
                        offers = offers.concat(loopOffers);
                        return [3 /*break*/, 15];
                    case 17: return [3 /*break*/, 26];
                    case 18:
                        if (!(token.category == 3)) return [3 /*break*/, 26];
                        return [4 /*yield*/, queryTemplates.getPackableHolders(token.address, expiry[1], orderBy, orderDirection, first, skip)];
                    case 19:
                        holders = _a.sent();
                        loopresponse = holders;
                        _a.label = 20;
                    case 20:
                        if (!(loopresponse.length >= 1000)) return [3 /*break*/, 22];
                        skip = holders.length;
                        return [4 /*yield*/, queryTemplates.getPackableHolders(token.address, expiry[1], orderBy, orderDirection, first, skip)];
                    case 21:
                        holders = _a.sent();
                        holders = holders.concat(loopresponse);
                        return [3 /*break*/, 20];
                    case 22:
                        skipOffers = 0;
                        return [4 /*yield*/, queryTemplates.getPackableOffers('sellToken: "' + token.address + '", sellId: "' + expiry[1] + '", isOpen: true', 'sellAmount', 'desc', 1000, skipOffers)];
                    case 23:
                        offers = _a.sent();
                        loopOffers = offers;
                        _a.label = 24;
                    case 24:
                        if (!(loopOffers.length >= 1000)) return [3 /*break*/, 26];
                        skipOffers = offers.length;
                        return [4 /*yield*/, queryTemplates.getPackableOffers('sellToken: "' + token.address + '", sellId: "' + expiry[1] + '", isOpen: true', 'sellAmount', 'desc', 1000, skipOffers)];
                    case 25:
                        offers = _a.sent();
                        offers = offers.concat(loopOffers);
                        return [3 /*break*/, 24];
                    case 26: return [2 /*return*/, new HoldersReportData(token.address, token.symbol, holders, offers, expiry)];
                }
            });
        });
    };
    Report.prototype.getDBUser = function (wallet, bearerToken, includeBank) {
        return __awaiter(this, void 0, void 0, function () {
            var array, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        array = [];
                        array.push(wallet);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, getUsersDataProtected(array, bearerToken, includeBank)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        e_1 = _a.sent();
                        console.error(e_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Report.prototype.getDexReport = function (timeLow, timeHigh, instruments, dex, hideNames) {
        if (hideNames === void 0) { hideNames = true; }
        return __awaiter(this, void 0, void 0, function () {
            var workbook, promises, i, sheet, error_16, buffer, err_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        workbook = new ExcelJS.Workbook();
                        promises = [];
                        for (i = 0; i < instruments.length; i++) {
                            sheet = workbook.addWorksheet(instruments[i].symbol);
                            promises.push(setDexSheet(sheet, timeLow, timeHigh, instruments[i], dex, this.url, hideNames));
                        }
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 10]);
                        return [4 /*yield*/, workbook.xlsx.writeFile('PiMarketsDEXReport.xlsx')];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 4:
                        error_16 = _a.sent();
                        return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                    case 5:
                        buffer = _a.sent();
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, FileSaver.saveAs(new Blob([buffer]), 'PiMarketsDEXReport.xlsx')];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        err_16 = _a.sent();
                        console.error(err_16);
                        return [3 /*break*/, 9];
                    case 9: return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    return Report;
}());
exports.Report = Report;
function getUserMonthStatsByIdentityByTime(_identity, _timeLow, _timeHigh, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var _stats, _kycMax, _flag;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getUserTxStatsByNameByTime(_identity, _timeLow, _timeHigh, _url)];
                case 1:
                    _stats = _a.sent();
                    _kycMax = 0;
                    _flag = 0;
                    _stats.push(_kycMax);
                    _stats.push(_flag);
                    console.log("-------------" + _stats[0]);
                    return [2 /*return*/, _stats];
            }
        });
    });
}
function getUserTxStatsByNameByTime(_identity, _timeLow, _timeHigh, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var txsAndName, txs, _nickname, _inputs, _outputs, _inputsAmount, _outputsAmount, _max, _maxSide, i, tx, txAmount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, try_getAllTransactionsByIdentity(_timeLow, _timeHigh, _identity, _url)];
                case 1:
                    txsAndName = _a.sent();
                    txs = txsAndName[0];
                    _nickname = txsAndName[1];
                    _inputs = 0;
                    _outputs = 0;
                    _inputsAmount = 0;
                    _outputsAmount = 0;
                    _max = 0;
                    _maxSide = true;
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < txs.length)) return [3 /*break*/, 5];
                    tx = txs[i];
                    return [4 /*yield*/, convertToUsd(parseFloat((0, utils_1.weiToEther)(tx.amount)), tx.currency.id, tx.timestamp)];
                case 3:
                    txAmount = _a.sent();
                    if (tx.from.name != null) {
                        if (tx.from.name.id == _nickname) {
                            //OUTPUT
                            _outputs++;
                            _outputsAmount += txAmount;
                        }
                    }
                    if (tx.to.name != null) {
                        if (tx.to.name.id == _nickname) {
                            //INPUT
                            _inputs++;
                            _inputsAmount += txAmount;
                        }
                    }
                    if (txAmount > _max) {
                        _max = txAmount;
                        if (tx.from.name != null) {
                            if (tx.from.name.id == _nickname) {
                                _maxSide = false;
                            }
                        }
                        if (tx.to.name != null) {
                            if (tx.to.name.id == _nickname) {
                                _maxSide = true;
                            }
                        }
                    }
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5:
                    if (!_maxSide)
                        _max *= -1;
                    return [2 /*return*/, [txsAndName[1], _inputs, _inputsAmount, _outputs, _outputsAmount, (_inputsAmount - _outputsAmount), _max]];
            }
        });
    });
}
function setTransactionSheet(sheet, timeLow, timeHigh, monthIndex, year, toMonthIndex, toYear, url, token, hideNames, name) {
    if (hideNames === void 0) { hideNames = true; }
    return __awaiter(this, void 0, void 0, function () {
        var day, week, month, dayCounter, weekCounter, weekRates, monthCounter, monthRates, weekZeros, monthZeros, _timeLow, _timeHigh, dayRows, weekRows, monthRows, txRows, rates, transactions, nextTx, nextTimestamp, txDayRow, amount, weekRow_1, dayRow, weekRow, monthRow, tableDay, tableWeek, tableMonth, tableName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    day = 1;
                    week = 1;
                    month = 1;
                    dayCounter = 0;
                    weekCounter = 0;
                    weekRates = 0;
                    monthCounter = 0;
                    monthRates = 0;
                    weekZeros = 0;
                    monthZeros = 0;
                    _timeLow = timeLow;
                    _timeHigh = _timeLow + ONE_UTC_DAY;
                    dayRows = [];
                    weekRows = [];
                    monthRows = [];
                    txRows = [];
                    return [4 /*yield*/, getDayRate(year, monthIndex, toYear, toMonthIndex, token.address, token.category)];
                case 1:
                    rates = _a.sent();
                    return [4 /*yield*/, try_getTransactions(timeLow, timeHigh, token.address, url, 0, name)];
                case 2:
                    transactions = _a.sent();
                    if (transactions.length > 0) {
                        nextTx = transactions.pop();
                        nextTimestamp = nextTx.timestamp;
                    }
                    else {
                        nextTimestamp = 0;
                    }
                    while (_timeHigh <= timeHigh) {
                        while ((_timeLow < nextTimestamp) && (nextTimestamp < _timeHigh)) {
                            txDayRow = [];
                            amount = parseFloat((0, utils_1.weiToEther)(nextTx.amount));
                            dayCounter = dayCounter + amount;
                            weekCounter = weekCounter + amount;
                            monthCounter = monthCounter + amount;
                            //TXs Table
                            txDayRow.push(new Date(nextTx.timestamp * 1000));
                            txDayRow.push(nextTx.currency.tokenSymbol);
                            if (!hideNames) {
                                if (nextTx.from.name == null) {
                                    txDayRow.push("");
                                }
                                else {
                                    txDayRow.push(nextTx.from.name.id);
                                }
                            }
                            else {
                                txDayRow.push(nextTx.from.id);
                            }
                            if (!hideNames) {
                                if (nextTx.to.name == null) {
                                    txDayRow.push("");
                                }
                                else {
                                    txDayRow.push(nextTx.to.name.id);
                                }
                            }
                            else {
                                txDayRow.push(nextTx.to.id);
                            }
                            txDayRow.push(parseFloat((0, utils_1.weiToEther)(nextTx.amount)));
                            txRows.push(txDayRow);
                            //pop new tx
                            if (transactions.length > 0) {
                                nextTx = transactions.pop();
                                nextTimestamp = nextTx.timestamp;
                            }
                            else {
                                nextTimestamp = 0;
                            }
                        }
                        //update week and month rate counters
                        weekRates = weekRates + rates[day - 1];
                        monthRates = monthRates + rates[day - 1];
                        if (rates[day - 1] == 0) {
                            weekZeros++;
                            monthZeros++;
                        }
                        //compute week
                        if (day == 7 * week) {
                            //calc this week rate
                            if ((7 - weekZeros) == 0) {
                                weekRates = 0;
                            }
                            else {
                                weekRates = weekRates / (7 - weekZeros);
                            }
                            weekRow_1 = [];
                            weekRow_1.push(week);
                            weekRow_1.push(weekCounter);
                            weekRow_1.push(weekCounter * weekRates);
                            weekRow_1.push(weekRates);
                            weekRows.push(weekRow_1);
                            //reset and update counters
                            week++;
                            weekCounter = 0;
                            weekRates = 0;
                            weekZeros = 0;
                        }
                        dayRow = [];
                        dayRow.push(day);
                        dayRow.push(dayCounter);
                        dayRow.push(dayCounter * rates[day - 1]);
                        dayRow.push(rates[day - 1]);
                        dayRows.push(dayRow);
                        //update and reset day counters
                        day++;
                        dayCounter = 0;
                        _timeLow = _timeHigh;
                        _timeHigh = _timeLow + ONE_UTC_DAY;
                    }
                    weekRow = [];
                    //calc 5th week rate
                    if ((day - 29 - weekZeros) == 0) {
                        weekRates = 0;
                    }
                    else {
                        weekRates = weekRates / (day - 29 - weekZeros);
                    }
                    //update week arrays
                    weekRow.push(week);
                    weekRow.push(weekCounter);
                    weekRow.push(weekCounter * weekRates);
                    weekRow.push(weekRates);
                    weekRows.push(weekRow);
                    monthRow = [];
                    //calc month rate
                    if ((day - 1 - monthZeros) == 0) {
                        monthRates = 0;
                    }
                    else {
                        monthRates = monthRates / (day - 1 - monthZeros);
                    }
                    //update month arrays
                    monthRow.push(month);
                    monthRow.push(monthCounter);
                    monthRow.push(monthCounter * monthRates);
                    monthRow.push(monthRates);
                    monthRows.push(monthRow);
                    tableDay = 'TablaDay' + token.symbol;
                    tableWeek = 'TablaWeek' + token.symbol;
                    tableMonth = 'TablaMonth' + token.symbol;
                    addTable(sheet, tableDay, 'B2', [
                        { name: 'Día', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' },
                        { name: 'Monto (USD)', totalsRowFunction: 'sum' },
                        { name: 'Tipo de cambio' }
                    ], dayRows);
                    addTable(sheet, tableWeek, 'G2', [
                        { name: 'Semana', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' },
                        { name: 'Monto (USD)', totalsRowFunction: 'sum' },
                        { name: 'Tipo de cambio' }
                    ], weekRows);
                    addTable(sheet, tableMonth, 'L2', [
                        { name: 'Mes', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' },
                        { name: 'Monto (USD)', totalsRowFunction: 'sum' },
                        { name: 'Tipo de cambio' }
                    ], monthRows);
                    tableName = 'Tabla' + token.symbol;
                    if (txRows.length == 0) {
                        txRows = getEmptyTransaction();
                    }
                    addTable(sheet, tableName, 'B36', [
                        { name: 'Fecha', filterButton: true },
                        { name: 'Divisa' },
                        { name: 'Origen (wallet)', filterButton: true },
                        { name: 'Destino (wallet)', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' }
                    ], txRows);
                    //CELL LABELS
                    sheet.getCell('B35').value = 'TRANSFERENCIAS';
                    sheet.getCell('B35').font = { bold: true };
                    sheet.getCell('B1').value = 'TOTAL (diario)';
                    sheet.getCell('B1').font = { bold: true };
                    sheet.getCell('G1').value = 'TOTAL (semanal)';
                    sheet.getCell('G1').font = { bold: true };
                    sheet.getCell('L1').value = 'TOTAL (mensual)';
                    sheet.getCell('L1').font = { bold: true };
                    return [2 /*return*/];
            }
        });
    });
}
function setTransactionSheetByArray(sheet, timeLow, timeHigh, addressesArray, url, token, hideNames) {
    if (hideNames === void 0) { hideNames = true; }
    return __awaiter(this, void 0, void 0, function () {
        var txRows, fromTxs, toTxs, nextTx, fromTimestamp, toTimestamp, txDayRow, tableName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    txRows = [];
                    return [4 /*yield*/, try_getTransactionsFromArray(timeLow, timeHigh, token.address, addressesArray, url, 0)];
                case 1:
                    fromTxs = _a.sent();
                    return [4 /*yield*/, try_getTransactionsToArray(timeLow, timeHigh, token.address, addressesArray, url, 0)];
                case 2:
                    toTxs = _a.sent();
                    while ((fromTxs.length > 0) || (toTxs.length > 0)) {
                        nextTx = void 0;
                        if (fromTxs.length == 0) {
                            nextTx = toTxs.pop();
                        }
                        else if (toTxs.length == 0) {
                            nextTx = fromTxs.pop();
                        }
                        else {
                            fromTimestamp = fromTxs[fromTxs.length - 1].timestamp;
                            toTimestamp = toTxs[toTxs.length - 1].timestamp;
                            if (fromTimestamp < toTimestamp) {
                                nextTx = fromTxs.pop();
                            }
                            else {
                                nextTx = toTxs.pop();
                            }
                        }
                        txDayRow = [];
                        //TXs Table
                        txDayRow.push(new Date(nextTx.timestamp * 1000));
                        txDayRow.push(nextTx.currency.tokenSymbol);
                        if (!hideNames) {
                            if (nextTx.from.name == null) {
                                txDayRow.push("");
                            }
                            else {
                                txDayRow.push(nextTx.from.name.id);
                            }
                        }
                        else {
                            txDayRow.push(nextTx.from.id);
                        }
                        if (!hideNames) {
                            if (nextTx.to.name == null) {
                                txDayRow.push("");
                            }
                            else {
                                txDayRow.push(nextTx.to.name.id);
                            }
                        }
                        else {
                            txDayRow.push(nextTx.to.id);
                        }
                        txDayRow.push(parseFloat((0, utils_1.weiToEther)(nextTx.amount)));
                        txRows.push(txDayRow);
                    }
                    tableName = 'Tabla' + token.symbol;
                    if (txRows.length == 0) {
                        txRows = getEmptyTransaction();
                    }
                    addTable(sheet, tableName, 'B2', [
                        { name: 'Fecha', filterButton: true },
                        { name: 'Divisa' },
                        { name: 'Origen (wallet)', filterButton: true },
                        { name: 'Destino (wallet)', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' }
                    ], txRows);
                    return [2 /*return*/];
            }
        });
    });
}
function setTokenDealsSheet(sheet, timeLow, timeHigh, monthIndex, year, toMonthIndex, toYear, url, token, hideNames) {
    if (hideNames === void 0) { hideNames = true; }
    return __awaiter(this, void 0, void 0, function () {
        var day, week, month, dayCounter, weekCounter, monthCounter, weekRates, monthRates, weekZeros, monthZeros, _timeLow, _timeHigh, dayRows, weekRows, monthRows, offersRows, requestsRows, dayOffers, dayRequests, rates, nextOffer, nextTimestamp, nextIsOffer, nextOfferTimestamp, nextRequestTimestamp, deals, q, amount, array, deals, q, amount, array, nextOfferTimestamp, nextRequestTimestamp, weekRow_2, dayRow, weekRow, monthRow, tableDay, tableWeek, tableMonth, tableName, tableName2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    day = 1;
                    week = 1;
                    month = 1;
                    dayCounter = 0;
                    weekCounter = 0;
                    monthCounter = 0;
                    weekRates = 0;
                    monthRates = 0;
                    weekZeros = 0;
                    monthZeros = 0;
                    _timeLow = timeLow;
                    _timeHigh = _timeLow + ONE_UTC_DAY;
                    dayRows = [];
                    weekRows = [];
                    monthRows = [];
                    offersRows = [];
                    requestsRows = [];
                    return [4 /*yield*/, try_getOffers(timeLow, timeHigh, token.address, url)];
                case 1:
                    dayOffers = _a.sent();
                    return [4 /*yield*/, try_getRequests(timeLow, timeHigh, token.address, url)];
                case 2:
                    dayRequests = _a.sent();
                    return [4 /*yield*/, getDayRate(year, monthIndex, toYear, toMonthIndex, token.address, token.category)];
                case 3:
                    rates = _a.sent();
                    if ((dayOffers.length == 0) && (dayRequests.length > 0)) {
                        nextOffer = dayRequests.pop();
                        nextTimestamp = nextOffer.timestamp;
                        nextIsOffer = false;
                    }
                    else if ((dayRequests.length == 0) && (dayOffers.length > 0)) {
                        nextOffer = dayOffers.pop();
                        nextTimestamp = nextOffer.timestamp;
                        nextIsOffer = true;
                    }
                    else if ((dayOffers.length > 0) || (dayRequests.length > 0)) {
                        nextOfferTimestamp = dayOffers[dayOffers.length - 1].timestamp;
                        nextRequestTimestamp = dayRequests[dayRequests.length - 1].timestamp;
                        if (nextOfferTimestamp < nextRequestTimestamp) {
                            nextOffer = dayOffers.pop();
                            nextTimestamp = nextOffer.timestamp;
                            nextIsOffer = true;
                        }
                        else {
                            nextOffer = dayRequests.pop();
                            nextTimestamp = nextOffer.timestamp;
                            nextIsOffer = false;
                        }
                    }
                    else {
                        nextTimestamp = 0;
                    }
                    while (_timeHigh <= timeHigh) {
                        while ((_timeLow < nextTimestamp) && (nextTimestamp < _timeHigh)) {
                            //compute offer
                            if (nextOffer.deals.length > 0) {
                                if (nextIsOffer) {
                                    deals = nextOffer.deals;
                                    for (q = 0; q < deals.length; q++) {
                                        amount = parseFloat((0, utils_1.weiToEther)(deals[q].sellAmount));
                                        dayCounter = dayCounter + amount;
                                        weekCounter = weekCounter + amount;
                                        monthCounter = monthCounter + amount;
                                        array = [];
                                        array.push(new Date(deals[q].timestamp * 1000));
                                        array.push(timeConverter(deals[q].offer.timestamp));
                                        array.push(timeConverter(deals[q].timestamp));
                                        array.push(deals[q].offer.buyToken.tokenSymbol);
                                        if (!hideNames) {
                                            if (deals[q].seller.name == null) {
                                                array.push("");
                                            }
                                            else {
                                                array.push(deals[q].seller.name);
                                            }
                                            if (deals[q].buyer.name == null) {
                                                array.push("");
                                            }
                                            else {
                                                array.push(deals[q].buyer.name);
                                            }
                                        }
                                        else {
                                            array.push(deals[q].seller.id);
                                            array.push(deals[q].buyer.id);
                                        }
                                        array.push(parseFloat((0, utils_1.weiToEther)(deals[q].sellAmount)));
                                        array.push(parseFloat((0, utils_1.weiToEther)(deals[q].buyAmount)));
                                        offersRows.push(array);
                                        //1 DEAL per iteration
                                    }
                                }
                                else {
                                    deals = nextOffer.deals;
                                    for (q = 0; q < deals.length; q++) {
                                        amount = parseFloat((0, utils_1.weiToEther)(deals[q].buyAmount));
                                        dayCounter = dayCounter + amount;
                                        weekCounter = weekCounter + amount;
                                        monthCounter = monthCounter + amount;
                                        array = [];
                                        array.push(new Date(deals[q].timestamp * 1000));
                                        array.push(timeConverter(deals[q].offer.timestamp));
                                        array.push(timeConverter(deals[q].timestamp));
                                        array.push(deals[q].offer.sellToken.tokenSymbol);
                                        if (!hideNames) {
                                            if (deals[q].seller.name == null) {
                                                array.push("");
                                            }
                                            else {
                                                array.push(deals[q].seller.name);
                                            }
                                            if (deals[q].buyer.name == null) {
                                                array.push("");
                                            }
                                            else {
                                                array.push(deals[q].buyer.name);
                                            }
                                        }
                                        else {
                                            array.push(deals[q].seller.id);
                                            array.push(deals[q].buyer.id);
                                        }
                                        array.push(parseFloat((0, utils_1.weiToEther)(deals[q].buyAmount)));
                                        array.push(parseFloat((0, utils_1.weiToEther)(deals[q].sellAmount)));
                                        requestsRows.push(array);
                                        //1 DEAL per iteration
                                    }
                                }
                            }
                            //pop new offer
                            if ((dayOffers.length == 0) && (dayRequests.length > 0)) {
                                nextOffer = dayRequests.pop();
                                nextTimestamp = nextOffer.timestamp;
                                nextIsOffer = false;
                            }
                            else if ((dayRequests.length == 0) && (dayOffers.length > 0)) {
                                nextOffer = dayOffers.pop();
                                nextTimestamp = nextOffer.timestamp;
                                nextIsOffer = true;
                            }
                            else if ((dayOffers.length > 0) || (dayRequests.length > 0)) {
                                nextOfferTimestamp = dayOffers[dayOffers.length - 1].timestamp;
                                nextRequestTimestamp = dayRequests[dayRequests.length - 1].timestamp;
                                if (nextOfferTimestamp < nextRequestTimestamp) {
                                    nextOffer = dayOffers.pop();
                                    nextTimestamp = nextOffer.timestamp;
                                    nextIsOffer = true;
                                }
                                else {
                                    nextOffer = dayRequests.pop();
                                    nextTimestamp = nextOffer.timestamp;
                                    nextIsOffer = false;
                                }
                            }
                            else {
                                nextTimestamp = 0;
                            }
                        }
                        //update week and month rates
                        weekRates = weekRates + rates[day - 1];
                        monthRates = monthRates + rates[day - 1];
                        if (rates[day - 1] == 0) {
                            weekZeros++;
                            monthZeros++;
                        }
                        //compute week
                        if (day == 7 * week) {
                            //WEEK
                            //calc week rate
                            if ((7 - weekZeros) == 0) {
                                weekRates = 0;
                            }
                            else {
                                weekRates = weekRates / (7 - weekZeros);
                            }
                            weekRow_2 = [];
                            weekRow_2.push(week);
                            weekRow_2.push(weekCounter);
                            weekRow_2.push(weekCounter * weekRates);
                            weekRow_2.push(weekRates);
                            weekRows.push(weekRow_2);
                            weekCounter = 0;
                            weekRates = 0;
                            weekZeros = 0;
                            week++;
                        }
                        dayRow = [];
                        dayRow.push(day);
                        dayRow.push(dayCounter);
                        dayRow.push(dayCounter * rates[day - 1]);
                        dayRow.push(rates[day - 1]);
                        dayRows.push(dayRow);
                        dayCounter = 0;
                        day++;
                        _timeLow = _timeHigh;
                        _timeHigh = _timeLow + ONE_UTC_DAY;
                    }
                    weekRow = [];
                    //calc 5th week rates
                    if ((day - 29 - weekZeros) == 0) {
                        weekRates = 0;
                    }
                    else {
                        weekRates = weekRates / (day - 29 - weekZeros);
                    }
                    weekRow.push(week);
                    weekRow.push(weekCounter);
                    weekRow.push(weekCounter * weekRates);
                    weekRow.push(weekRates);
                    weekRows.push(weekRow);
                    monthRow = [];
                    if ((day - 1 - monthZeros) == 0) {
                        monthRates = 0;
                    }
                    else {
                        monthRates = monthRates / (day - 1 - monthZeros);
                    }
                    monthRow.push(month);
                    monthRow.push(monthCounter);
                    monthRow.push(monthCounter * monthRates);
                    monthRow.push(monthRates);
                    monthRows.push(monthRow);
                    tableDay = 'TablaDay' + token.symbol;
                    tableWeek = 'TablaWeek' + token.symbol;
                    tableMonth = 'TablaMonth' + token.symbol;
                    addTable(sheet, tableDay, 'B3', [
                        { name: 'Día', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' },
                        { name: 'Monto (USD)', totalsRowFunction: 'sum' },
                        { name: 'Tipo de cambio' }
                    ], dayRows);
                    addTable(sheet, tableWeek, 'G3', [
                        { name: 'Semana', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' },
                        { name: 'Monto (USD)', totalsRowFunction: 'sum' },
                        { name: 'Tipo de cambio' }
                    ], weekRows);
                    addTable(sheet, tableMonth, 'L3', [
                        { name: 'Mes', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' },
                        { name: 'Monto (USD)', totalsRowFunction: 'sum' },
                        { name: 'Tipo de cambio' }
                    ], monthRows);
                    sheet.getCell('B36').value = 'PACTOS (' + token.symbol + ' OFERTADO)';
                    sheet.getCell('B36').font = { bold: true };
                    tableName = 'Tabla' + token.symbol;
                    if (offersRows.length == 0) {
                        offersRows = getEmtpyDeal();
                    }
                    addTable(sheet, tableName, 'B37', [
                        { name: 'Fecha (pacto)', filterButton: true },
                        { name: 'Hora (oferta)' },
                        { name: 'Hora (pacto)' },
                        { name: 'Contrapartida', filterButton: true },
                        { name: 'Vendedor', filterButton: true },
                        { name: 'Comprador', filterButton: true },
                        { name: 'Monto pactado (' + token.symbol + ')', totalsRowFunction: 'sum' },
                        { name: 'Monto contrapartida', totalsRowFunction: 'sum' }
                    ], offersRows);
                    sheet.getCell('K36').value = 'PACTOS (' + token.symbol + ' DEMANDADO)';
                    sheet.getCell('K36').font = { bold: true };
                    tableName2 = 'Tabla2' + token.symbol;
                    if (requestsRows.length == 0) {
                        requestsRows = getEmtpyDeal();
                    }
                    addTable(sheet, tableName2, 'K37', [
                        { name: 'Fecha (pacto)', filterButton: true },
                        { name: 'Hora (oferta)' },
                        { name: 'Hora (pacto)' },
                        { name: 'Contrapartida', filterButton: true },
                        { name: 'Vendedor', filterButton: true },
                        { name: 'Comprador', filterButton: true },
                        { name: 'Monto pactado (' + token.symbol + ')', totalsRowFunction: 'sum' },
                        { name: 'Monto contrapartida', totalsRowFunction: 'sum' }
                    ], requestsRows);
                    sheet.getCell('C1').value = 'Mercado P2P (Secundario)';
                    sheet.getCell('C1').font = { bold: true };
                    sheet.getCell('B2').value = 'TOTAL (diario)';
                    sheet.getCell('B2').font = { bold: true };
                    sheet.getCell('G2').value = 'TOTAL (semanal)';
                    sheet.getCell('G2').font = { bold: true };
                    sheet.getCell('L2').value = 'TOTAL (mensual)';
                    sheet.getCell('L2').font = { bold: true };
                    return [2 /*return*/];
            }
        });
    });
}
function setPrimaryTokenDealsSheet(sheet, timeLow, timeHigh, monthIndex, year, toMonthIndex, toYear, url, token, hideNames) {
    if (hideNames === void 0) { hideNames = true; }
    return __awaiter(this, void 0, void 0, function () {
        var day, week, month, dayCounter, weekCounter, monthCounter, weekRates, monthRates, weekZeros, monthZeros, _timeLow, _timeHigh, dayRows, weekRows, monthRows, offersRows, requestsRows, dayOffers, dayRequests, rates, nextOffer, nextTimestamp, nextIsOffer, nextOfferTimestamp, nextRequestTimestamp, deals, q, amount, array, deals, q, amount, array, nextOfferTimestamp, nextRequestTimestamp, weekRow_3, dayRow, weekRow, monthRow, tableDayPrimary, tableWeekPrimary, tableMonthPrimary, tableName3, tableName4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    day = 1;
                    week = 1;
                    month = 1;
                    dayCounter = 0;
                    weekCounter = 0;
                    monthCounter = 0;
                    weekRates = 0;
                    monthRates = 0;
                    weekZeros = 0;
                    monthZeros = 0;
                    _timeLow = timeLow;
                    _timeHigh = _timeLow + ONE_UTC_DAY;
                    dayRows = [];
                    weekRows = [];
                    monthRows = [];
                    offersRows = [];
                    requestsRows = [];
                    return [4 /*yield*/, try_getOffersPrimary(timeLow, timeHigh, token.address, url)];
                case 1:
                    dayOffers = _a.sent();
                    return [4 /*yield*/, try_getRequestsPrimary(timeLow, timeHigh, token.address, url)];
                case 2:
                    dayRequests = _a.sent();
                    return [4 /*yield*/, getDayRate(year, monthIndex, toYear, toMonthIndex, token.address, token.category)];
                case 3:
                    rates = _a.sent();
                    if ((dayOffers.length == 0) && (dayRequests.length > 0)) {
                        nextOffer = dayRequests.pop();
                        nextTimestamp = nextOffer.timestamp;
                        nextIsOffer = false;
                    }
                    else if ((dayRequests.length == 0) && (dayOffers.length > 0)) {
                        nextOffer = dayOffers.pop();
                        nextTimestamp = nextOffer.timestamp;
                        nextIsOffer = true;
                    }
                    else if ((dayOffers.length > 0) || (dayRequests.length > 0)) {
                        nextOfferTimestamp = dayOffers[dayOffers.length - 1].timestamp;
                        nextRequestTimestamp = dayRequests[dayRequests.length - 1].timestamp;
                        if (nextOfferTimestamp < nextRequestTimestamp) {
                            nextOffer = dayOffers.pop();
                            nextTimestamp = nextOffer.timestamp;
                            nextIsOffer = true;
                        }
                        else {
                            nextOffer = dayRequests.pop();
                            nextTimestamp = nextOffer.timestamp;
                            nextIsOffer = false;
                        }
                    }
                    else {
                        nextTimestamp = 0;
                    }
                    while (_timeHigh <= timeHigh) {
                        while ((_timeLow < nextTimestamp) && (nextTimestamp < _timeHigh)) {
                            //compute offer
                            if (nextOffer.deals.length > 0) {
                                if (nextIsOffer) {
                                    deals = nextOffer.deals;
                                    for (q = 0; q < deals.length; q++) {
                                        amount = parseFloat((0, utils_1.weiToEther)(deals[q].sellAmount));
                                        dayCounter = dayCounter + amount;
                                        weekCounter = weekCounter + amount;
                                        monthCounter = monthCounter + amount;
                                        array = [];
                                        array.push(new Date(deals[q].timestamp * 1000));
                                        array.push(timeConverter(deals[q].offer.timestamp));
                                        array.push(timeConverter(deals[q].timestamp));
                                        array.push(deals[q].offer.buyToken.tokenSymbol);
                                        if (!hideNames) {
                                            if (deals[q].seller.name == null) {
                                                array.push("");
                                            }
                                            else {
                                                array.push(deals[q].seller.name);
                                            }
                                            if (deals[q].buyer.name == null) {
                                                array.push("");
                                            }
                                            else {
                                                array.push(deals[q].buyer.name);
                                            }
                                        }
                                        else {
                                            array.push(deals[q].seller.id);
                                            array.push(deals[q].buyer.id);
                                        }
                                        array.push(parseFloat((0, utils_1.weiToEther)(deals[q].sellAmount)));
                                        array.push(parseFloat((0, utils_1.weiToEther)(deals[q].buyAmount)));
                                        offersRows.push(array);
                                        //1 DEAL per iteration
                                    }
                                }
                                else {
                                    deals = nextOffer.deals;
                                    for (q = 0; q < deals.length; q++) {
                                        amount = parseFloat((0, utils_1.weiToEther)(deals[q].buyAmount));
                                        dayCounter = dayCounter + amount;
                                        weekCounter = weekCounter + amount;
                                        monthCounter = monthCounter + amount;
                                        array = [];
                                        array.push(new Date(deals[q].timestamp * 1000));
                                        array.push(timeConverter(deals[q].offer.timestamp));
                                        array.push(timeConverter(deals[q].timestamp));
                                        array.push(deals[q].offer.sellToken.tokenSymbol);
                                        if (!hideNames) {
                                            if (deals[q].seller.name == null) {
                                                array.push("");
                                            }
                                            else {
                                                array.push(deals[q].seller.name);
                                            }
                                            if (deals[q].buyer.name == null) {
                                                array.push("");
                                            }
                                            else {
                                                array.push(deals[q].buyer.name);
                                            }
                                        }
                                        else {
                                            array.push(deals[q].seller.id);
                                            array.push(deals[q].buyer.id);
                                        }
                                        array.push(parseFloat((0, utils_1.weiToEther)(deals[q].buyAmount)));
                                        array.push(parseFloat((0, utils_1.weiToEther)(deals[q].sellAmount)));
                                        requestsRows.push(array);
                                        //1 DEAL per iteration
                                    }
                                }
                            }
                            //pop new offer
                            if ((dayOffers.length == 0) && (dayRequests.length > 0)) {
                                nextOffer = dayRequests.pop();
                                nextTimestamp = nextOffer.timestamp;
                                nextIsOffer = false;
                            }
                            else if ((dayRequests.length == 0) && (dayOffers.length > 0)) {
                                nextOffer = dayOffers.pop();
                                nextTimestamp = nextOffer.timestamp;
                                nextIsOffer = true;
                            }
                            else if ((dayOffers.length > 0) || (dayRequests.length > 0)) {
                                nextOfferTimestamp = dayOffers[dayOffers.length - 1].timestamp;
                                nextRequestTimestamp = dayRequests[dayRequests.length - 1].timestamp;
                                if (nextOfferTimestamp < nextRequestTimestamp) {
                                    nextOffer = dayOffers.pop();
                                    nextTimestamp = nextOffer.timestamp;
                                    nextIsOffer = true;
                                }
                                else {
                                    nextOffer = dayRequests.pop();
                                    nextTimestamp = nextOffer.timestamp;
                                    nextIsOffer = false;
                                }
                            }
                            else {
                                nextTimestamp = 0;
                            }
                        }
                        //update week and month rates
                        weekRates = weekRates + rates[day - 1];
                        monthRates = monthRates + rates[day - 1];
                        if (rates[day - 1] == 0) {
                            weekZeros++;
                            monthZeros++;
                        }
                        //compute week
                        if (day == 7 * week) {
                            //WEEK
                            //calc week rate
                            if ((7 - weekZeros) == 0) {
                                weekRates = 0;
                            }
                            else {
                                weekRates = weekRates / (7 - weekZeros);
                            }
                            weekRow_3 = [];
                            weekRow_3.push(week);
                            weekRow_3.push(weekCounter);
                            weekRow_3.push(weekCounter * weekRates);
                            weekRow_3.push(weekRates);
                            weekRows.push(weekRow_3);
                            weekCounter = 0;
                            weekRates = 0;
                            weekZeros = 0;
                            week++;
                        }
                        dayRow = [];
                        dayRow.push(day);
                        dayRow.push(dayCounter);
                        dayRow.push(dayCounter * rates[day - 1]);
                        dayRow.push(rates[day - 1]);
                        dayRows.push(dayRow);
                        dayCounter = 0;
                        day++;
                        _timeLow = _timeHigh;
                        _timeHigh = _timeLow + ONE_UTC_DAY;
                    }
                    weekRow = [];
                    //calc 5th week rates
                    if ((day - 29 - weekZeros) == 0) {
                        weekRates = 0;
                    }
                    else {
                        weekRates = weekRates / (day - 29 - weekZeros);
                    }
                    weekRow.push(week);
                    weekRow.push(weekCounter);
                    weekRow.push(weekCounter * weekRates);
                    weekRow.push(weekRates);
                    weekRows.push(weekRow);
                    monthRow = [];
                    if ((day - 1 - monthZeros) == 0) {
                        monthRates = 0;
                    }
                    else {
                        monthRates = monthRates / (day - 1 - monthZeros);
                    }
                    monthRow.push(month);
                    monthRow.push(monthCounter);
                    monthRow.push(monthCounter * monthRates);
                    monthRow.push(monthRates);
                    monthRows.push(monthRow);
                    tableDayPrimary = 'TablaDayPrimary' + token.symbol;
                    tableWeekPrimary = 'TablaWeekPrimary' + token.symbol;
                    tableMonthPrimary = 'TablaMonthPrimary' + token.symbol;
                    addTable(sheet, tableDayPrimary, 'B3', [
                        { name: 'Día', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' },
                        { name: 'Monto (USD)', totalsRowFunction: 'sum' },
                        { name: 'Tipo de cambio' }
                    ], dayRows);
                    addTable(sheet, tableWeekPrimary, 'G3', [
                        { name: 'Semana', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' },
                        { name: 'Monto (USD)', totalsRowFunction: 'sum' },
                        { name: 'Tipo de cambio' }
                    ], weekRows);
                    addTable(sheet, tableMonthPrimary, 'L3', [
                        { name: 'Mes', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' },
                        { name: 'Monto (USD)', totalsRowFunction: 'sum' },
                        { name: 'Tipo de cambio' }
                    ], monthRows);
                    sheet.getCell('B36').value = 'PACTOS (' + token.symbol + ' OFERTADO)';
                    sheet.getCell('B36').font = { bold: true };
                    tableName3 = 'TablaPrimario' + token.symbol;
                    if (offersRows.length == 0) {
                        offersRows = getEmtpyDeal();
                    }
                    addTable(sheet, tableName3, 'B37', [
                        { name: 'Fecha (pacto)', filterButton: true },
                        { name: 'Hora (oferta)' },
                        { name: 'Hora (pacto)' },
                        { name: 'Contrapartida', filterButton: true },
                        { name: 'Vendedor', filterButton: true },
                        { name: 'Comprador', filterButton: true },
                        { name: 'Monto pactado (primario) (' + token.symbol + ')', totalsRowFunction: 'sum' },
                        { name: 'Monto contrapartida', totalsRowFunction: 'sum' }
                    ], offersRows);
                    sheet.getCell('K36').value = token.symbol + ' DEMANDADO';
                    sheet.getCell('K36').font = { bold: true };
                    tableName4 = 'TablaPrimario2' + token.symbol;
                    if (requestsRows.length == 0) {
                        requestsRows = getEmtpyDeal();
                    }
                    addTable(sheet, tableName4, 'K37', [
                        { name: 'Fecha (pacto)', filterButton: true },
                        { name: 'Hora (oferta)' },
                        { name: 'Hora (pacto)' },
                        { name: 'Contrapartida', filterButton: true },
                        { name: 'Vendedor', filterButton: true },
                        { name: 'Comprador', filterButton: true },
                        { name: 'Monto pactado (primario) (' + token.symbol + ')', totalsRowFunction: 'sum' },
                        { name: 'Monto contrapartida', totalsRowFunction: 'sum' }
                    ], requestsRows);
                    sheet.getCell('C1').value = 'Mercado P2P (Primario)';
                    sheet.getCell('C1').font = { bold: true };
                    sheet.getCell('B2').value = 'TOTAL (diario)';
                    sheet.getCell('B2').font = { bold: true };
                    sheet.getCell('G2').value = 'TOTAL (semanal)';
                    sheet.getCell('G2').font = { bold: true };
                    sheet.getCell('L2').value = 'TOTAL (mensual)';
                    sheet.getCell('L2').font = { bold: true };
                    return [2 /*return*/];
            }
        });
    });
}
function setPackableDealsSheet(sheet, timeLow, timeHigh, url, token, hideNames) {
    if (hideNames === void 0) { hideNames = true; }
    return __awaiter(this, void 0, void 0, function () {
        var day, week, month, dayCounter, weekCounter, monthCounter, dayCounterUsd, weekCounterUsd, monthCounterUsd, _timeLow, _timeHigh, dayRows, weekRows, monthRows, offersRows, requestsRows, dayOffers, dayRequests, nextOffer, nextTimestamp, nextIsOffer, nextOfferTimestamp, nextRequestTimestamp, deals, q, amount, buyAmount, usdAmount, array, deals, q, amount, sellAmount, usdAmount, array, nextOfferTimestamp, nextRequestTimestamp, weekRow_4, dayRow, weekRow, monthRow, tableDay, tableWeek, tableMonth, tableName, tableName2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    day = 1;
                    week = 1;
                    month = 1;
                    dayCounter = 0;
                    weekCounter = 0;
                    monthCounter = 0;
                    dayCounterUsd = 0;
                    weekCounterUsd = 0;
                    monthCounterUsd = 0;
                    _timeLow = timeLow;
                    _timeHigh = _timeLow + ONE_UTC_DAY;
                    dayRows = [];
                    weekRows = [];
                    monthRows = [];
                    offersRows = [];
                    requestsRows = [];
                    return [4 /*yield*/, try_getPackableOffers(timeLow, timeHigh, token.address, url)];
                case 1:
                    dayOffers = _a.sent();
                    return [4 /*yield*/, try_getPackableRequests(timeLow, timeHigh, token.address, url)];
                case 2:
                    dayRequests = _a.sent();
                    if ((dayOffers.length == 0) && (dayRequests.length > 0)) {
                        nextOffer = dayRequests.pop();
                        nextTimestamp = nextOffer.timestamp;
                        nextIsOffer = false;
                    }
                    else if ((dayRequests.length == 0) && (dayOffers.length > 0)) {
                        nextOffer = dayOffers.pop();
                        nextTimestamp = nextOffer.timestamp;
                        nextIsOffer = true;
                    }
                    else if ((dayOffers.length > 0) || (dayRequests.length > 0)) {
                        nextOfferTimestamp = dayOffers[dayOffers.length - 1].timestamp;
                        nextRequestTimestamp = dayRequests[dayRequests.length - 1].timestamp;
                        if (nextOfferTimestamp < nextRequestTimestamp) {
                            nextOffer = dayOffers.pop();
                            nextTimestamp = nextOffer.timestamp;
                            nextIsOffer = true;
                        }
                        else {
                            nextOffer = dayRequests.pop();
                            nextTimestamp = nextOffer.timestamp;
                            nextIsOffer = false;
                        }
                    }
                    else {
                        nextTimestamp = 0;
                    }
                    _a.label = 3;
                case 3:
                    if (!(_timeHigh <= timeHigh)) return [3 /*break*/, 19];
                    _a.label = 4;
                case 4:
                    if (!((_timeLow < nextTimestamp) && (nextTimestamp < _timeHigh))) return [3 /*break*/, 18];
                    if (!(nextOffer.deals.length > 0)) return [3 /*break*/, 17];
                    if (!nextIsOffer) return [3 /*break*/, 11];
                    deals = nextOffer.deals;
                    q = 0;
                    _a.label = 5;
                case 5:
                    if (!(q < deals.length)) return [3 /*break*/, 10];
                    amount = parseFloat((0, utils_1.weiToEther)(deals[q].sellAmount));
                    buyAmount = parseFloat((0, utils_1.weiToEther)(deals[q].buyAmount));
                    dayCounter = dayCounter + amount;
                    weekCounter = weekCounter + amount;
                    monthCounter = monthCounter + amount;
                    usdAmount = 0;
                    if (!((deals[q].offer.buyToken.id == Constants.USD.address) ||
                        (deals[q].offer.buyToken.id == Constants.USC.address) ||
                        (deals[q].offer.buyToken.id == Constants.PEL.address))) return [3 /*break*/, 6];
                    usdAmount = buyAmount;
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, convertToUsd(buyAmount, deals[q].offer.buyToken.id, deals[q].timestamp)];
                case 7:
                    usdAmount = _a.sent();
                    _a.label = 8;
                case 8:
                    dayCounterUsd = dayCounterUsd + usdAmount;
                    weekCounterUsd = weekCounterUsd + usdAmount;
                    monthCounterUsd = monthCounterUsd + usdAmount;
                    array = [];
                    array.push(new Date(deals[q].timestamp * 1000));
                    array.push(timeConverter(deals[q].offer.timestamp));
                    array.push(timeConverter(deals[q].timestamp));
                    array.push(deals[q].offer.buyToken.tokenSymbol);
                    if (!hideNames) {
                        if (deals[q].seller.name == null) {
                            array.push("");
                        }
                        else {
                            array.push(deals[q].seller.name);
                        }
                        if (deals[q].buyer.name == null) {
                            array.push("");
                        }
                        else {
                            array.push(deals[q].buyer.name);
                        }
                    }
                    else {
                        array.push(deals[q].seller.id);
                        array.push(deals[q].buyer.id);
                    }
                    array.push(parseFloat((0, utils_1.weiToEther)(deals[q].sellAmount)));
                    array.push(parseFloat((0, utils_1.weiToEther)(deals[q].buyAmount)));
                    offersRows.push(array);
                    _a.label = 9;
                case 9:
                    q++;
                    return [3 /*break*/, 5];
                case 10: return [3 /*break*/, 17];
                case 11:
                    deals = nextOffer.deals;
                    q = 0;
                    _a.label = 12;
                case 12:
                    if (!(q < deals.length)) return [3 /*break*/, 17];
                    amount = parseFloat((0, utils_1.weiToEther)(deals[q].buyAmount));
                    sellAmount = parseFloat((0, utils_1.weiToEther)(deals[q].sellAmount));
                    dayCounter = dayCounter + amount;
                    weekCounter = weekCounter + amount;
                    monthCounter = monthCounter + amount;
                    usdAmount = 0;
                    if (!((deals[q].offer.sellToken.id == Constants.USD.address) ||
                        (deals[q].offer.sellToken.id == Constants.USC.address) ||
                        (deals[q].offer.sellToken.id == Constants.PEL.address))) return [3 /*break*/, 13];
                    usdAmount = sellAmount;
                    return [3 /*break*/, 15];
                case 13: return [4 /*yield*/, convertToUsd(sellAmount, deals[q].offer.sellToken.id, deals[q].timestamp)];
                case 14:
                    usdAmount = _a.sent();
                    _a.label = 15;
                case 15:
                    dayCounterUsd = dayCounterUsd + usdAmount;
                    weekCounterUsd = weekCounterUsd + usdAmount;
                    monthCounterUsd = monthCounterUsd + usdAmount;
                    array = [];
                    array.push(new Date(deals[q].timestamp * 1000));
                    array.push(timeConverter(deals[q].offer.timestamp));
                    array.push(timeConverter(deals[q].timestamp));
                    array.push(deals[q].offer.sellToken.tokenSymbol);
                    if (!hideNames) {
                        if (deals[q].seller.name == null) {
                            array.push("");
                        }
                        else {
                            array.push(deals[q].seller.name);
                        }
                        if (deals[q].buyer.name == null) {
                            array.push("");
                        }
                        else {
                            array.push(deals[q].buyer.name);
                        }
                    }
                    else {
                        array.push(deals[q].seller.id);
                        array.push(deals[q].buyer.id);
                    }
                    array.push(parseFloat((0, utils_1.weiToEther)(deals[q].buyAmount)));
                    array.push(parseFloat((0, utils_1.weiToEther)(deals[q].sellAmount)));
                    requestsRows.push(array);
                    _a.label = 16;
                case 16:
                    q++;
                    return [3 /*break*/, 12];
                case 17:
                    //pop new offer
                    if ((dayOffers.length == 0) && (dayRequests.length > 0)) {
                        nextOffer = dayRequests.pop();
                        nextTimestamp = nextOffer.timestamp;
                        nextIsOffer = false;
                    }
                    else if ((dayRequests.length == 0) && (dayOffers.length > 0)) {
                        nextOffer = dayOffers.pop();
                        nextTimestamp = nextOffer.timestamp;
                        nextIsOffer = true;
                    }
                    else if ((dayOffers.length > 0) || (dayRequests.length > 0)) {
                        nextOfferTimestamp = dayOffers[dayOffers.length - 1].timestamp;
                        nextRequestTimestamp = dayRequests[dayRequests.length - 1].timestamp;
                        if (nextOfferTimestamp < nextRequestTimestamp) {
                            nextOffer = dayOffers.pop();
                            nextTimestamp = nextOffer.timestamp;
                            nextIsOffer = true;
                        }
                        else {
                            nextOffer = dayRequests.pop();
                            nextTimestamp = nextOffer.timestamp;
                            nextIsOffer = false;
                        }
                    }
                    else {
                        nextTimestamp = 0;
                    }
                    return [3 /*break*/, 4];
                case 18:
                    //compute week
                    if (day == 7 * week) {
                        weekRow_4 = [];
                        //secondary
                        weekRow_4.push(week);
                        weekRow_4.push(weekCounter);
                        weekRow_4.push(weekCounterUsd);
                        if (weekCounter == 0)
                            weekCounter = 1;
                        weekRow_4.push(weekCounterUsd / weekCounter);
                        weekRows.push(weekRow_4);
                        weekCounter = 0;
                        weekCounterUsd = 0;
                        week++;
                    }
                    dayRow = [];
                    dayRow.push(day);
                    dayRow.push(dayCounter);
                    dayRow.push(dayCounterUsd);
                    if (dayCounter == 0)
                        dayCounter = 1;
                    dayRow.push(dayCounterUsd / dayCounter);
                    dayRows.push(dayRow);
                    dayCounter = 0;
                    dayCounterUsd = 0;
                    day++;
                    _timeLow = _timeHigh;
                    _timeHigh = _timeLow + ONE_UTC_DAY;
                    return [3 /*break*/, 3];
                case 19:
                    weekRow = [];
                    weekRow.push(week);
                    weekRow.push(weekCounter);
                    weekRow.push(weekCounterUsd);
                    if (weekCounter == 0)
                        weekCounter = 1;
                    weekRow.push(weekCounterUsd / weekCounter);
                    weekRows.push(weekRow);
                    monthRow = [];
                    monthRow.push(month);
                    monthRow.push(monthCounter);
                    monthRow.push(monthCounterUsd);
                    if (monthCounter == 0)
                        monthCounter = 1;
                    monthRow.push(monthCounterUsd / monthCounter);
                    monthRows.push(monthRow);
                    tableDay = 'TablaDay' + token.symbol;
                    tableWeek = 'TablaWeek' + token.symbol;
                    tableMonth = 'TablaMonth' + token.symbol;
                    addTable(sheet, tableDay, 'B3', [
                        { name: 'Día', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' },
                        { name: 'Monto (USD)', totalsRowFunction: 'sum' },
                        { name: 'Tipo de cambio' }
                    ], dayRows);
                    addTable(sheet, tableWeek, 'G3', [
                        { name: 'Semana', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' },
                        { name: 'Monto (USD)', totalsRowFunction: 'sum' },
                        { name: 'Tipo de cambio' }
                    ], weekRows);
                    addTable(sheet, tableMonth, 'L3', [
                        { name: 'Mes', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' },
                        { name: 'Monto (USD)', totalsRowFunction: 'sum' },
                        { name: 'Tipo de cambio' }
                    ], monthRows);
                    sheet.getCell('B36').value = 'PACTOS (' + token.symbol + ' OFERTADO)';
                    sheet.getCell('B36').font = { bold: true };
                    tableName = 'Tabla' + token.symbol;
                    if (offersRows.length == 0) {
                        offersRows = getEmtpyDeal();
                    }
                    addTable(sheet, tableName, 'B37', [
                        { name: 'Fecha (pacto)', filterButton: true },
                        { name: 'Hora (oferta)' },
                        { name: 'Hora (pacto)' },
                        { name: 'Contrapartida', filterButton: true },
                        { name: 'Vendedor', filterButton: true },
                        { name: 'Comprador', filterButton: true },
                        { name: 'Monto pactado (' + token.symbol + ')', totalsRowFunction: 'sum' },
                        { name: 'Monto contrapartida', totalsRowFunction: 'sum' }
                    ], offersRows);
                    sheet.getCell('K36').value = 'PACTOS (' + token.symbol + ' DEMANDADO)';
                    sheet.getCell('K36').font = { bold: true };
                    tableName2 = 'Tabla2' + token.symbol;
                    if (requestsRows.length == 0) {
                        requestsRows = getEmtpyDeal();
                    }
                    addTable(sheet, tableName2, 'K37', [
                        { name: 'Fecha (pacto)', filterButton: true },
                        { name: 'Hora (oferta)' },
                        { name: 'Hora (pacto)' },
                        { name: 'Contrapartida', filterButton: true },
                        { name: 'Vendedor', filterButton: true },
                        { name: 'Comprador', filterButton: true },
                        { name: 'Monto pactado (' + token.symbol + ')', totalsRowFunction: 'sum' },
                        { name: 'Monto contrapartida', totalsRowFunction: 'sum' }
                    ], requestsRows);
                    sheet.getCell('C1').value = 'Mercado P2P (Secundario)';
                    sheet.getCell('C1').font = { bold: true };
                    sheet.getCell('B2').value = 'TOTAL (diario)';
                    sheet.getCell('B2').font = { bold: true };
                    sheet.getCell('G2').value = 'TOTAL (semanal)';
                    sheet.getCell('G2').font = { bold: true };
                    sheet.getCell('L2').value = 'TOTAL (mensual)';
                    sheet.getCell('L2').font = { bold: true };
                    return [2 /*return*/];
            }
        });
    });
}
function setPrimaryPackableDealsSheet(sheet, timeLow, timeHigh, url, token, hideNames) {
    if (hideNames === void 0) { hideNames = true; }
    return __awaiter(this, void 0, void 0, function () {
        var day, week, month, dayCounter, weekCounter, monthCounter, dayCounterUsd, weekCounterUsd, monthCounterUsd, _timeLow, _timeHigh, dayRows, weekRows, monthRows, offersRows, requestsRows, dayOffers, dayRequests, nextOffer, nextTimestamp, nextIsOffer, nextOfferTimestamp, nextRequestTimestamp, deals, q, amount, buyAmount, usdAmount, array, deals, q, amount, sellAmount, usdAmount, array, nextOfferTimestamp, nextRequestTimestamp, weekRow_5, dayRow, weekRow, monthRow, tableDayPrimary, tableWeekPrimary, tableMonthPrimary, tableName3, tableName4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    day = 1;
                    week = 1;
                    month = 1;
                    dayCounter = 0;
                    weekCounter = 0;
                    monthCounter = 0;
                    dayCounterUsd = 0;
                    weekCounterUsd = 0;
                    monthCounterUsd = 0;
                    _timeLow = timeLow;
                    _timeHigh = _timeLow + ONE_UTC_DAY;
                    dayRows = [];
                    weekRows = [];
                    monthRows = [];
                    offersRows = [];
                    requestsRows = [];
                    return [4 /*yield*/, try_getPackableOffersPrimary(timeLow, timeHigh, token.address, url)];
                case 1:
                    dayOffers = _a.sent();
                    return [4 /*yield*/, try_getPackableRequestsPrimary(timeLow, timeHigh, token.address, url)];
                case 2:
                    dayRequests = _a.sent();
                    if ((dayOffers.length == 0) && (dayRequests.length > 0)) {
                        nextOffer = dayRequests.pop();
                        nextTimestamp = nextOffer.timestamp;
                        nextIsOffer = false;
                    }
                    else if ((dayRequests.length == 0) && (dayOffers.length > 0)) {
                        nextOffer = dayOffers.pop();
                        nextTimestamp = nextOffer.timestamp;
                        nextIsOffer = true;
                    }
                    else if ((dayOffers.length > 0) || (dayRequests.length > 0)) {
                        nextOfferTimestamp = dayOffers[dayOffers.length - 1].timestamp;
                        nextRequestTimestamp = dayRequests[dayRequests.length - 1].timestamp;
                        if (nextOfferTimestamp < nextRequestTimestamp) {
                            nextOffer = dayOffers.pop();
                            nextTimestamp = nextOffer.timestamp;
                            nextIsOffer = true;
                        }
                        else {
                            nextOffer = dayRequests.pop();
                            nextTimestamp = nextOffer.timestamp;
                            nextIsOffer = false;
                        }
                    }
                    else {
                        nextTimestamp = 0;
                    }
                    _a.label = 3;
                case 3:
                    if (!(_timeHigh <= timeHigh)) return [3 /*break*/, 19];
                    _a.label = 4;
                case 4:
                    if (!((_timeLow < nextTimestamp) && (nextTimestamp < _timeHigh))) return [3 /*break*/, 18];
                    if (!(nextOffer.deals.length > 0)) return [3 /*break*/, 17];
                    if (!nextIsOffer) return [3 /*break*/, 11];
                    deals = nextOffer.deals;
                    q = 0;
                    _a.label = 5;
                case 5:
                    if (!(q < deals.length)) return [3 /*break*/, 10];
                    amount = parseFloat((0, utils_1.weiToEther)(deals[q].sellAmount));
                    buyAmount = parseFloat((0, utils_1.weiToEther)(deals[q].buyAmount));
                    dayCounter = dayCounter + amount;
                    weekCounter = weekCounter + amount;
                    monthCounter = monthCounter + amount;
                    usdAmount = 0;
                    if (!((deals[q].offer.buyToken.id == Constants.USD.address) ||
                        (deals[q].offer.buyToken.id == Constants.USC.address) ||
                        (deals[q].offer.buyToken.id == Constants.PEL.address))) return [3 /*break*/, 6];
                    usdAmount = buyAmount;
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, convertToUsd(buyAmount, deals[q].offer.buyToken.id, deals[q].timestamp)];
                case 7:
                    usdAmount = _a.sent();
                    _a.label = 8;
                case 8:
                    dayCounterUsd = dayCounterUsd + usdAmount;
                    weekCounterUsd = weekCounterUsd + usdAmount;
                    monthCounterUsd = monthCounterUsd + usdAmount;
                    array = [];
                    array.push(new Date(deals[q].timestamp * 1000));
                    array.push(timeConverter(deals[q].offer.timestamp));
                    array.push(timeConverter(deals[q].timestamp));
                    array.push(deals[q].offer.buyToken.tokenSymbol);
                    if (!hideNames) {
                        if (deals[q].seller.name == null) {
                            array.push("");
                        }
                        else {
                            array.push(deals[q].seller.name);
                        }
                        if (deals[q].buyer.name == null) {
                            array.push("");
                        }
                        else {
                            array.push(deals[q].buyer.name);
                        }
                    }
                    else {
                        array.push(deals[q].seller.id);
                        array.push(deals[q].buyer.id);
                    }
                    array.push(parseFloat((0, utils_1.weiToEther)(deals[q].sellAmount)));
                    array.push(parseFloat((0, utils_1.weiToEther)(deals[q].buyAmount)));
                    offersRows.push(array);
                    _a.label = 9;
                case 9:
                    q++;
                    return [3 /*break*/, 5];
                case 10: return [3 /*break*/, 17];
                case 11:
                    deals = nextOffer.deals;
                    q = 0;
                    _a.label = 12;
                case 12:
                    if (!(q < deals.length)) return [3 /*break*/, 17];
                    amount = parseFloat((0, utils_1.weiToEther)(deals[q].buyAmount));
                    sellAmount = parseFloat((0, utils_1.weiToEther)(deals[q].sellAmount));
                    dayCounter = dayCounter + amount;
                    weekCounter = weekCounter + amount;
                    monthCounter = monthCounter + amount;
                    usdAmount = 0;
                    if (!((deals[q].offer.sellToken.id == Constants.USD.address) ||
                        (deals[q].offer.sellToken.id == Constants.USC.address) ||
                        (deals[q].offer.sellToken.id == Constants.PEL.address))) return [3 /*break*/, 13];
                    usdAmount = sellAmount;
                    return [3 /*break*/, 15];
                case 13: return [4 /*yield*/, convertToUsd(sellAmount, deals[q].offer.sellToken.id, deals[q].timestamp)];
                case 14:
                    usdAmount = _a.sent();
                    _a.label = 15;
                case 15:
                    dayCounterUsd = dayCounterUsd + usdAmount;
                    weekCounterUsd = weekCounterUsd + usdAmount;
                    monthCounterUsd = monthCounterUsd + usdAmount;
                    array = [];
                    array.push(new Date(deals[q].timestamp * 1000));
                    array.push(timeConverter(deals[q].offer.timestamp));
                    array.push(timeConverter(deals[q].timestamp));
                    array.push(deals[q].offer.sellToken.tokenSymbol);
                    if (!hideNames) {
                        if (deals[q].seller.name == null) {
                            array.push("");
                        }
                        else {
                            array.push(deals[q].seller.name);
                        }
                        if (deals[q].buyer.name == null) {
                            array.push("");
                        }
                        else {
                            array.push(deals[q].buyer.name);
                        }
                    }
                    else {
                        array.push(deals[q].seller.id);
                        array.push(deals[q].buyer.id);
                    }
                    array.push(parseFloat((0, utils_1.weiToEther)(deals[q].buyAmount)));
                    array.push(parseFloat((0, utils_1.weiToEther)(deals[q].sellAmount)));
                    requestsRows.push(array);
                    _a.label = 16;
                case 16:
                    q++;
                    return [3 /*break*/, 12];
                case 17:
                    //pop new offer
                    if ((dayOffers.length == 0) && (dayRequests.length > 0)) {
                        nextOffer = dayRequests.pop();
                        nextTimestamp = nextOffer.timestamp;
                        nextIsOffer = false;
                    }
                    else if ((dayRequests.length == 0) && (dayOffers.length > 0)) {
                        nextOffer = dayOffers.pop();
                        nextTimestamp = nextOffer.timestamp;
                        nextIsOffer = true;
                    }
                    else if ((dayOffers.length > 0) || (dayRequests.length > 0)) {
                        nextOfferTimestamp = dayOffers[dayOffers.length - 1].timestamp;
                        nextRequestTimestamp = dayRequests[dayRequests.length - 1].timestamp;
                        if (nextOfferTimestamp < nextRequestTimestamp) {
                            nextOffer = dayOffers.pop();
                            nextTimestamp = nextOffer.timestamp;
                            nextIsOffer = true;
                        }
                        else {
                            nextOffer = dayRequests.pop();
                            nextTimestamp = nextOffer.timestamp;
                            nextIsOffer = false;
                        }
                    }
                    else {
                        nextTimestamp = 0;
                    }
                    return [3 /*break*/, 4];
                case 18:
                    //compute week
                    if (day == 7 * week) {
                        weekRow_5 = [];
                        weekRow_5.push(week);
                        weekRow_5.push(weekCounter);
                        weekRow_5.push(weekCounterUsd);
                        if (weekCounter == 0)
                            weekCounter = 1;
                        weekRow_5.push(weekCounterUsd / weekCounter);
                        weekRows.push(weekRow_5);
                        weekCounter = 0;
                        weekCounterUsd = 0;
                        week++;
                    }
                    dayRow = [];
                    dayRow.push(day);
                    dayRow.push(dayCounter);
                    dayRow.push(dayCounterUsd);
                    if (dayCounter == 0)
                        dayCounter = 1;
                    dayRow.push(dayCounterUsd / dayCounter);
                    dayRows.push(dayRow);
                    dayCounter = 0;
                    dayCounterUsd = 0;
                    day++;
                    _timeLow = _timeHigh;
                    _timeHigh = _timeLow + ONE_UTC_DAY;
                    return [3 /*break*/, 3];
                case 19:
                    weekRow = [];
                    weekRow.push(week);
                    weekRow.push(weekCounter);
                    weekRow.push(weekCounterUsd);
                    if (weekCounter == 0)
                        weekCounter = 1;
                    weekRow.push(weekCounterUsd / weekCounter);
                    weekRows.push(weekRow);
                    monthRow = [];
                    monthRow.push(month);
                    monthRow.push(monthCounter);
                    monthRow.push(monthCounterUsd);
                    if (monthCounter == 0)
                        monthCounter = 1;
                    monthRow.push(monthCounterUsd / monthCounter);
                    monthRows.push(monthRow);
                    tableDayPrimary = 'TablaDayPrimary' + token.symbol;
                    tableWeekPrimary = 'TablaWeekPrimary' + token.symbol;
                    tableMonthPrimary = 'TablaMonthPrimary' + token.symbol;
                    addTable(sheet, tableDayPrimary, 'B3', [
                        { name: 'Día', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' },
                        { name: 'Monto (USD)', totalsRowFunction: 'sum' },
                        { name: 'Tipo de cambio' }
                    ], dayRows);
                    addTable(sheet, tableWeekPrimary, 'G3', [
                        { name: 'Semana', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' },
                        { name: 'Monto (USD)', totalsRowFunction: 'sum' },
                        { name: 'Tipo de cambio' }
                    ], weekRows);
                    addTable(sheet, tableMonthPrimary, 'L3', [
                        { name: 'Mes', filterButton: true },
                        { name: 'Monto', totalsRowFunction: 'sum' },
                        { name: 'Monto (USD)', totalsRowFunction: 'sum' },
                        { name: 'Tipo de cambio' }
                    ], monthRows);
                    sheet.getCell('B36').value = 'PACTOS (' + token.symbol + ' OFERTADO)';
                    sheet.getCell('B36').font = { bold: true };
                    tableName3 = 'TablaPrimario' + token.symbol;
                    if (offersRows.length == 0) {
                        offersRows = getEmtpyDeal();
                    }
                    addTable(sheet, tableName3, 'B37', [
                        { name: 'Fecha (pacto)', filterButton: true },
                        { name: 'Hora (oferta)' },
                        { name: 'Hora (pacto)' },
                        { name: 'Contrapartida', filterButton: true },
                        { name: 'Vendedor', filterButton: true },
                        { name: 'Comprador', filterButton: true },
                        { name: 'Monto pactado (primario) (' + token.symbol + ')', totalsRowFunction: 'sum' },
                        { name: 'Monto contrapartida', totalsRowFunction: 'sum' }
                    ], offersRows);
                    sheet.getCell('K36').value = token.symbol + ' DEMANDADO';
                    sheet.getCell('K36').font = { bold: true };
                    tableName4 = 'TablaPrimario2' + token.symbol;
                    if (requestsRows.length == 0) {
                        requestsRows = getEmtpyDeal();
                    }
                    addTable(sheet, tableName4, 'K37', [
                        { name: 'Fecha (pacto)', filterButton: true },
                        { name: 'Hora (oferta)' },
                        { name: 'Hora (pacto)' },
                        { name: 'Contrapartida', filterButton: true },
                        { name: 'Vendedor', filterButton: true },
                        { name: 'Comprador', filterButton: true },
                        { name: 'Monto pactado (primario) (' + token.symbol + ')', totalsRowFunction: 'sum' },
                        { name: 'Monto contrapartida', totalsRowFunction: 'sum' }
                    ], requestsRows);
                    sheet.getCell('C1').value = 'Mercado P2P (Primario)';
                    sheet.getCell('C1').font = { bold: true };
                    sheet.getCell('B2').value = 'TOTAL (diario)';
                    sheet.getCell('B2').font = { bold: true };
                    sheet.getCell('G2').value = 'TOTAL (semanal)';
                    sheet.getCell('G2').font = { bold: true };
                    sheet.getCell('L2').value = 'TOTAL (mensual)';
                    sheet.getCell('L2').font = { bold: true };
                    return [2 /*return*/];
            }
        });
    });
}
function setBalancesTable(sheet, balances, tableName, tableCell) {
    return __awaiter(this, void 0, void 0, function () {
        var balanceRows, k, array, symbolName, packables, m, expiry, symbol;
        return __generator(this, function (_a) {
            balanceRows = [];
            for (k = 0; k < balances.length; k++) {
                array = [];
                if (balances[k].token.tokenKind == 1) {
                    array.push(balances[k].token.tokenSymbol);
                    array.push(parseFloat((0, utils_1.weiToEther)(balances[k].balance)));
                    balanceRows.push(array);
                }
                else if (balances[k].token.tokenKind == 2) {
                    array.push(balances[k].token.tokenSymbol);
                    array.push(parseFloat((0, utils_1.weiToEther)(balances[k].balance)));
                    balanceRows.push(array);
                }
                else if (balances[k].token.tokenKind == 3) {
                    symbolName = balances[k].token.tokenSymbol;
                    packables = balances[k].packables[0].balances;
                    for (m = 0; m < packables.length; m++) {
                        expiry = timeConverter(packables[m].packableId.metadata[0]);
                        symbol = String(symbolName).concat(" ").concat(expiry);
                        array.push(symbol);
                        array.push(parseInt((0, utils_1.weiToEther)(packables[m].balance)));
                        balanceRows.push(array);
                        array = [];
                    }
                }
            }
            addTable(sheet, tableName, tableCell, [
                { name: 'Activo' },
                { name: 'Saldo' }
            ], balanceRows);
            return [2 /*return*/];
        });
    });
}
function setDexSheet(sheet, timeLow, timeHigh, instrument, dex, url, hideNames) {
    if (hideNames === void 0) { hideNames = true; }
    return __awaiter(this, void 0, void 0, function () {
        var deals, dealsRow, i, deal, dealRow, tableName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, try_getDexDeals(timeLow, timeHigh, instrument.pair, dex, url)];
                case 1:
                    deals = _a.sent();
                    dealsRow = [];
                    for (i = 0; i < deals.length; i++) {
                        deal = deals[i];
                        dealRow = [];
                        dealRow.push(new Date(deal.timestamp * 1000));
                        if (deal.side == "1") {
                            //amountA is in nominatorToken
                            //amountB is in baseToken (PEL)
                            //orderA-SELL & orderB-BUY
                            //SELLER
                            if (!hideNames) {
                                if (deal.orderA.owner.name == null) {
                                    dealRow.push("");
                                }
                                else {
                                    dealRow.push(deal.orderA.owner.name);
                                }
                            }
                            else {
                                dealRow.push(deal.orderA.owner.id);
                            }
                            //BUYER
                            if (!hideNames) {
                                if (deal.orderB.owner.name == null) {
                                    dealRow.push("");
                                }
                                else {
                                    dealRow.push(deal.orderB.owner.name);
                                }
                            }
                            else {
                                dealRow.push(deal.orderB.owner.id);
                            }
                            //PRICE
                            dealRow.push(parseFloat((0, utils_1.weiToEther)(deal.price)));
                            //AMOUNT (in nominatorToken)
                            dealRow.push(parseFloat((0, utils_1.weiToEther)(deal.amountA)));
                            //AMOUNT (in baseToken aka PEL)
                            dealRow.push(parseFloat((0, utils_1.weiToEther)(deal.amountB)));
                        }
                        else {
                            //amountA is in baseToken (PEL)
                            //amountB is in nominatorToken
                            //orderA-BUY & orderB-SELL
                            //SELLER
                            if (!hideNames) {
                                if (deal.orderB.owner.name == null) {
                                    dealRow.push("");
                                }
                                else {
                                    dealRow.push(deal.orderB.owner.name);
                                }
                            }
                            else {
                                dealRow.push(deal.orderB.owner.id);
                            }
                            //BUYER
                            if (!hideNames) {
                                if (deal.orderA.owner.name == null) {
                                    dealRow.push("");
                                }
                                else {
                                    dealRow.push(deal.orderA.owner.name);
                                }
                            }
                            else {
                                dealRow.push(deal.orderA.owner.id);
                            }
                            //PRICE
                            dealRow.push(parseFloat((0, utils_1.weiToEther)(deal.price)));
                            //AMOUNT (in nominatorToken)
                            dealRow.push(parseFloat((0, utils_1.weiToEther)(deal.amountB)));
                            //AMOUNT (in baseToken aka PEL)
                            dealRow.push(parseFloat((0, utils_1.weiToEther)(deal.amountA)));
                        }
                        dealsRow.push(dealRow);
                    }
                    tableName = 'Tabla' + instrument.symbol;
                    if (dealsRow.length == 0) {
                        dealsRow = [[new Date(), "", "", 0, 0, 0]];
                    }
                    addTable(sheet, tableName, 'B2', [
                        { name: 'Fecha', filterButton: true },
                        { name: 'Vendedor', filterButton: true },
                        { name: 'Comprador', filterButton: true },
                        { name: 'Precio', totalsRowFunction: 'average' },
                        { name: 'Cantidad', totalsRowFunction: 'sum' },
                        { name: 'Cantidad (contrapartida)', totalsRowFunction: 'sum' }
                    ], dealsRow);
                    return [2 /*return*/];
            }
        });
    });
}
function try_getTransactions(_timeLow, _timeHigh, token, url, retries, name) {
    if (retries === void 0) { retries = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var transactions, error_17;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 10]);
                    return [4 /*yield*/, getTransactions(_timeLow, _timeHigh, token, url)];
                case 1:
                    transactions = _a.sent();
                    if (!(name == undefined)) return [3 /*break*/, 3];
                    return [4 /*yield*/, getTransactions(_timeLow, _timeHigh, token, url)];
                case 2:
                    transactions = _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, getTransactionsByName(_timeLow, _timeHigh, token, name, url)];
                case 4:
                    transactions = _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/, transactions];
                case 6:
                    error_17 = _a.sent();
                    if (!(retries < 10)) return [3 /*break*/, 8];
                    retries++;
                    console.log("-- REINTENTO DE QUERY: " + retries);
                    return [4 /*yield*/, try_getTransactions(_timeLow, _timeHigh, token, url, retries + 1)];
                case 7:
                    transactions = _a.sent();
                    console.log("-- REINTENTO EXITOSO --");
                    return [2 /*return*/, transactions];
                case 8:
                    console.error(error_17);
                    throw new Error(error_17);
                case 9: return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function try_getTransactionsFromArray(_timeLow, _timeHigh, token, addressesArray, url, retries) {
    if (retries === void 0) { retries = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var transactions, error_18;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4 /*yield*/, getTransactionsFromArray(_timeLow, _timeHigh, token, addressesArray, url)];
                case 1:
                    transactions = _a.sent();
                    return [2 /*return*/, transactions];
                case 2:
                    error_18 = _a.sent();
                    if (!(retries < 5)) return [3 /*break*/, 4];
                    console.log("-- REINTENTO DE QUERY: " + retries);
                    return [4 /*yield*/, try_getTransactionsFromArray(_timeLow, _timeHigh, token, addressesArray, url, retries + 1)];
                case 3:
                    transactions = _a.sent();
                    console.log("-- REINTENTO EXITOSO --");
                    return [2 /*return*/, transactions];
                case 4:
                    console.error(error_18);
                    throw new Error(error_18);
                case 5: return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function try_getTransactionsToArray(_timeLow, _timeHigh, token, addressesArray, url, retries) {
    if (retries === void 0) { retries = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var transactions, error_19;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4 /*yield*/, getTransactionsToArray(_timeLow, _timeHigh, token, addressesArray, url)];
                case 1:
                    transactions = _a.sent();
                    return [2 /*return*/, transactions];
                case 2:
                    error_19 = _a.sent();
                    if (!(retries < 5)) return [3 /*break*/, 4];
                    console.log("-- REINTENTO DE QUERY: " + retries);
                    return [4 /*yield*/, try_getTransactionsToArray(_timeLow, _timeHigh, token, addressesArray, url, retries + 1)];
                case 3:
                    transactions = _a.sent();
                    console.log("-- REINTENTO EXITOSO --");
                    return [2 /*return*/, transactions];
                case 4:
                    console.error(error_19);
                    throw new Error(error_19);
                case 5: return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getTransactions(_timeLow, _timeHigh, _tokenAddress, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryTransactions, transactions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ transactions(first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + ', currency:"' + _tokenAddress + '"}, orderBy: timestamp, orderDirection: desc) { from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } }';
                    queryService = new graph_1.Query('bank', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryTransactions = response.transactions;
                    transactions = queryTransactions;
                    _a.label = 2;
                case 2:
                    if (!(queryTransactions.length >= 1000)) return [3 /*break*/, 4];
                    skip = transactions.length;
                    query = '{ transactions(first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + ', currency:"' + _tokenAddress + '"}, orderBy: timestamp, orderDirection: desc) { from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryTransactions = response.transactions;
                    transactions = transactions.concat(queryTransactions);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, transactions];
            }
        });
    });
}
function getTransactionsFromArray(_timeLow, _timeHigh, _tokenAddress, _addressesArray, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, stringArray, query, queryService, response, queryTransactions, transactions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    stringArray = _addressesArray.join('", "');
                    query = '{ transactions(first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + ', currency:"' + _tokenAddress + '", from_in:["' + stringArray + '"]}, orderBy: timestamp, orderDirection: desc) { from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } }';
                    queryService = new graph_1.Query('bank', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryTransactions = response.transactions;
                    transactions = queryTransactions;
                    _a.label = 2;
                case 2:
                    if (!(queryTransactions.length >= 1000)) return [3 /*break*/, 4];
                    skip = transactions.length;
                    query = '{ transactions(first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + ', currency:"' + _tokenAddress + '", from_in:["' + stringArray + '"]}, orderBy: timestamp, orderDirection: desc) { from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryTransactions = response.transactions;
                    transactions = transactions.concat(queryTransactions);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, transactions];
            }
        });
    });
}
function getTransactionsToArray(_timeLow, _timeHigh, _tokenAddress, _addressesArray, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, stringArray, query, queryService, response, queryTransactions, transactions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    stringArray = _addressesArray.join('", "');
                    query = '{ transactions(first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + ', currency:"' + _tokenAddress + '", to_in:["' + stringArray + '"]}, orderBy: timestamp, orderDirection: desc) { from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } }';
                    queryService = new graph_1.Query('bank', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryTransactions = response.transactions;
                    transactions = queryTransactions;
                    _a.label = 2;
                case 2:
                    if (!(queryTransactions.length >= 1000)) return [3 /*break*/, 4];
                    skip = transactions.length;
                    query = '{ transactions(first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + ', currency:"' + _tokenAddress + '", to_in:["' + stringArray + '"]}, orderBy: timestamp, orderDirection: desc) { from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryTransactions = response.transactions;
                    transactions = transactions.concat(queryTransactions);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, transactions];
            }
        });
    });
}
function getAllTransactions(_timeLow, _timeHigh, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryTransactions, transactions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ transactions(first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + '}, orderBy: timestamp, orderDirection: desc) { from { id identity {id} name { id } } to { id identity {id} name { id } } currency { tokenSymbol id tokenKind } amount timestamp } }';
                    queryService = new graph_1.Query('bank', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryTransactions = response.transactions;
                    transactions = queryTransactions;
                    _a.label = 2;
                case 2:
                    if (!(queryTransactions.length >= 1000)) return [3 /*break*/, 4];
                    skip = transactions.length;
                    query = '{ transactions(first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + '}, orderBy: timestamp, orderDirection: desc) { from { id identity {id} name { id } } to { id identity {id} name { id } } currency { tokenSymbol id tokenKind } amount timestamp } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryTransactions = response.transactions;
                    transactions = transactions.concat(queryTransactions);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, transactions];
            }
        });
    });
}
function getTransactionsByName(_timeLow, _timeHigh, _tokenAddress, _name, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryTransactions, transactions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ names(where:{id:"' + _name + '"}) { wallet { transactions (first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + ', currency:"' + _tokenAddress + '"} orderBy: timestamp, orderDirection: desc) { id from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } } } }';
                    queryService = new graph_1.Query('bank', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryTransactions = response.names[0].wallet.transactions;
                    transactions = queryTransactions;
                    _a.label = 2;
                case 2:
                    if (!(queryTransactions.length >= 1000)) return [3 /*break*/, 4];
                    skip = transactions.length;
                    query = '{ names(where:{id:"' + _name + '"}) { wallet { transactions (first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + ', currency:"' + _tokenAddress + '"} orderBy: timestamp, orderDirection: desc) { id from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } } } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryTransactions = response.names[0].wallet.transactions;
                    transactions = transactions.concat(queryTransactions);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, transactions];
            }
        });
    });
}
function getAllTransactionsByName(_timeLow, _timeHigh, _name, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryTransactions, transactions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ names(where:{id:"' + _name + '"}) { wallet { transactions (first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + '} orderBy: timestamp, orderDirection: desc) { id from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } } } }';
                    queryService = new graph_1.Query('bank', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryTransactions = response.names[0].wallet.transactions;
                    transactions = queryTransactions;
                    _a.label = 2;
                case 2:
                    if (!(queryTransactions.length >= 1000)) return [3 /*break*/, 4];
                    skip = transactions.length;
                    query = '{ names(where:{id:"' + _name + '"}) { wallet { transactions (first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + '} orderBy: timestamp, orderDirection: desc) { id from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } } } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryTransactions = response.names[0].wallet.transactions;
                    transactions = transactions.concat(queryTransactions);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, transactions];
            }
        });
    });
}
function try_getAllTransactionsByIdentity(_timeLow, _timeHigh, _identity, _url, retries) {
    if (retries === void 0) { retries = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var txsAndName, error_20;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4 /*yield*/, getAllTransactionsByIdentity(_timeLow, _timeHigh, _identity, _url)];
                case 1:
                    txsAndName = _a.sent();
                    return [2 /*return*/, txsAndName];
                case 2:
                    error_20 = _a.sent();
                    if (!(retries < 10)) return [3 /*break*/, 4];
                    console.log("-- REINTENTO DE QUERY: " + retries);
                    return [4 /*yield*/, try_getAllTransactionsByIdentity(_timeLow, _timeHigh, _identity, _url, retries + 1)];
                case 3:
                    txsAndName = _a.sent();
                    console.log("-- REINTENTO EXITOSO --");
                    return [2 /*return*/, txsAndName];
                case 4:
                    console.log("------------ SUPERAMOS REINTENTOS");
                    console.error(error_20);
                    throw new Error(error_20);
                case 5: return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getAllTransactionsByIdentity(_timeLow, _timeHigh, _identity, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryTransactions, transactions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ identity(id:"' + _identity + '") { wallet { name { id } transactions (first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + '} orderBy: timestamp, orderDirection: desc){ id from { id name { id } } to { id name { id } } currency { id tokenSymbol } amount timestamp } } } }';
                    queryService = new graph_1.Query('bank', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryTransactions = response.identity.wallet.transactions;
                    transactions = queryTransactions;
                    _a.label = 2;
                case 2:
                    if (!(queryTransactions.length >= 1000)) return [3 /*break*/, 4];
                    skip = transactions.length;
                    query = '{ identity(id:"' + _identity + '") { wallet { name { id } transactions (first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + '} orderBy: timestamp, orderDirection: desc){ id from { id name { id } } to { id name { id } } currency { id tokenSymbol } amount timestamp } } } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryTransactions = response.identity.wallet.transactions;
                    transactions = transactions.concat(queryTransactions);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, [transactions, response.identity.wallet.name.id]];
            }
        });
    });
}
function try_getOffers(_timeLow, _timeHigh, token, url, retries) {
    if (retries === void 0) { retries = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var offers, error_21;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4 /*yield*/, getOffers(_timeLow, _timeHigh, token, url)];
                case 1:
                    offers = _a.sent();
                    return [2 /*return*/, offers];
                case 2:
                    error_21 = _a.sent();
                    if (!(retries < 10)) return [3 /*break*/, 4];
                    retries++;
                    console.log("-- REINTENTO DE QUERY: " + retries);
                    return [4 /*yield*/, try_getOffers(_timeLow, _timeHigh, token, url, retries + 1)];
                case 3:
                    offers = _a.sent();
                    console.log("-- REINTENTO EXITOSO --");
                    return [2 /*return*/, offers];
                case 4:
                    console.error(error_21);
                    throw new Error(error_21);
                case 5: return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getOffers(_timeLow, _timeHigh, _tokensAddress, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryOffers, offers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ offers (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
                    queryService = new graph_1.Query('p2p', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryOffers = response.offers;
                    offers = queryOffers;
                    _a.label = 2;
                case 2:
                    if (!(queryOffers.length >= 1000)) return [3 /*break*/, 4];
                    skip = offers.length;
                    query = '{ offers (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryOffers = response.offers;
                    offers = offers.concat(queryOffers);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, offers];
            }
        });
    });
}
function getAllDeals(_timeLow, _timeHigh, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryOffers, offers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ deals (where: {timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } }';
                    queryService = new graph_1.Query('p2p', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryOffers = response.deals;
                    offers = queryOffers;
                    _a.label = 2;
                case 2:
                    if (!(queryOffers.length >= 1000)) return [3 /*break*/, 4];
                    skip = offers.length;
                    query = '{ deals (where: {timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryOffers = response.deals;
                    offers = offers.concat(queryOffers);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, offers];
            }
        });
    });
}
function getUserAllDeals(_nickname, _timeLow, _timeHigh, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryDeals, deals, query_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ users(where:{name:"' + _nickname + '"}) { deals (where:{timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy:timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { seller { id name } buyer { id name } offer { timestamp sellToken { id tokenSymbol } buyToken { id tokenSymbol } } sellAmount buyAmount timestamp } } }';
                    queryService = new graph_1.Query('p2p', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryDeals = response.users[0].deals;
                    deals = queryDeals;
                    _a.label = 2;
                case 2:
                    if (!(queryDeals.length >= 1000)) return [3 /*break*/, 4];
                    skip = deals.length;
                    query_1 = '{ users(where:{name:"' + _nickname + '"}) { deals (where:{timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy:timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { seller { id name } buyer { id name } offer { timestamp sellToken { id tokenSymbol } buyToken { id tokenSymbol } } sellAmount buyAmount timestamp } } }';
                    queryService.setCustomQuery(query_1);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryDeals = response.users[0].deals;
                    deals = deals.concat(queryDeals);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, deals];
            }
        });
    });
}
function getUserPackableAllDeals(_nickname, _timeLow, _timeHigh, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryDeals, deals, query_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ users(where:{name:"' + _nickname + '"}) { packableDeals (where:{timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy:timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { seller { id name } buyer { id name } offer { timestamp sellToken { id tokenSymbol } buyToken { id tokenSymbol } } sellAmount buyAmount timestamp } } }';
                    queryService = new graph_1.Query('p2p', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryDeals = response.users[0].packableDeals;
                    deals = queryDeals;
                    _a.label = 2;
                case 2:
                    if (!(queryDeals.length >= 1000)) return [3 /*break*/, 4];
                    skip = deals.length;
                    query_2 = '{ users(where:{name:"' + _nickname + '"}) { packableDeals (where:{timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy:timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { seller { id name } buyer { id name } offer { timestamp sellToken { id tokenSymbol } buyToken { id tokenSymbol } } sellAmount buyAmount timestamp } } }';
                    queryService.setCustomQuery(query_2);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryDeals = response.users[0].packableDeals;
                    deals = deals.concat(queryDeals);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, deals];
            }
        });
    });
}
function getUserAllDealsPrimary(_nickname, _timeLow, _timeHigh, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryDeals, deals, query_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ users(where:{name:"' + _nickname + '"}) { deals (where:{timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy:timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { seller { id name } buyer { id name } offer { timestamp sellToken { id tokenSymbol } buyToken { id tokenSymbol } } sellAmount buyAmount timestamp } } }';
                    queryService = new graph_1.Query('p2p-primary', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryDeals = response.users[0].deals;
                    deals = queryDeals;
                    _a.label = 2;
                case 2:
                    if (!(queryDeals.length >= 1000)) return [3 /*break*/, 4];
                    skip = deals.length;
                    query_3 = '{ users(where:{name:"' + _nickname + '"}) { deals (where:{timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy:timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { seller { id name } buyer { id name } offer { timestamp sellToken { id tokenSymbol } buyToken { id tokenSymbol } } sellAmount buyAmount timestamp } } }';
                    queryService.setCustomQuery(query_3);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryDeals = response.users[0].deals;
                    deals = deals.concat(queryDeals);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, deals];
            }
        });
    });
}
function getUserPackableAllDealsPrimary(_nickname, _timeLow, _timeHigh, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryDeals, deals, query_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ users(where:{name:"' + _nickname + '"}) { packableDeals (where:{timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy:timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { seller { id name } buyer { id name } offer { timestamp sellToken { id tokenSymbol } buyToken { id tokenSymbol } } sellAmount buyAmount timestamp } } }';
                    queryService = new graph_1.Query('p2p-primary', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryDeals = response.users[0].packableDeals;
                    deals = queryDeals;
                    _a.label = 2;
                case 2:
                    if (!(queryDeals.length >= 1000)) return [3 /*break*/, 4];
                    skip = deals.length;
                    query_4 = '{ users(where:{name:"' + _nickname + '"}) { packableDeals (where:{timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy:timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { seller { id name } buyer { id name } offer { timestamp sellToken { id tokenSymbol } buyToken { id tokenSymbol } } sellAmount buyAmount timestamp } } }';
                    queryService.setCustomQuery(query_4);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryDeals = response.users[0].packableDeals;
                    deals = deals.concat(queryDeals);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, deals];
            }
        });
    });
}
function try_getRequests(_timeLow, _timeHigh, token, url, retries) {
    if (retries === void 0) { retries = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var offers, error_22;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4 /*yield*/, getRequests(_timeLow, _timeHigh, token, url)];
                case 1:
                    offers = _a.sent();
                    return [2 /*return*/, offers];
                case 2:
                    error_22 = _a.sent();
                    if (!(retries < 10)) return [3 /*break*/, 4];
                    retries++;
                    console.log("-- REINTENTO DE QUERY: " + retries);
                    return [4 /*yield*/, try_getRequests(_timeLow, _timeHigh, token, url, retries + 1)];
                case 3:
                    offers = _a.sent();
                    console.log("-- REINTENTO EXITOSO --");
                    return [2 /*return*/, offers];
                case 4:
                    console.error(error_22);
                    throw new Error(error_22);
                case 5: return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getRequests(_timeLow, _timeHigh, _tokensAddress, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryOffers, offers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ offers (where: {buyToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
                    queryService = new graph_1.Query('p2p', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryOffers = response.offers;
                    offers = queryOffers;
                    _a.label = 2;
                case 2:
                    if (!(queryOffers.length >= 1000)) return [3 /*break*/, 4];
                    skip = offers.length;
                    query = '{ offers (where: {buyToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryOffers = response.offers;
                    offers = offers.concat(queryOffers);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, offers];
            }
        });
    });
}
function try_getOffersPrimary(_timeLow, _timeHigh, token, url, retries) {
    if (retries === void 0) { retries = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var offers, error_23;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4 /*yield*/, getOffersPrimary(_timeLow, _timeHigh, token, url)];
                case 1:
                    offers = _a.sent();
                    return [2 /*return*/, offers];
                case 2:
                    error_23 = _a.sent();
                    if (!(retries < 10)) return [3 /*break*/, 4];
                    retries++;
                    console.log("-- REINTENTO DE QUERY: " + retries);
                    return [4 /*yield*/, try_getOffersPrimary(_timeLow, _timeHigh, token, url, retries + 1)];
                case 3:
                    offers = _a.sent();
                    console.log("-- REINTENTO EXITOSO --");
                    return [2 /*return*/, offers];
                case 4:
                    console.error(error_23);
                    throw new Error(error_23);
                case 5: return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getOffersPrimary(_timeLow, _timeHigh, _tokensAddress, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryOffers, offers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ offers (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
                    queryService = new graph_1.Query('p2p-primary', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryOffers = response.offers;
                    offers = queryOffers;
                    _a.label = 2;
                case 2:
                    if (!(queryOffers.length >= 1000)) return [3 /*break*/, 4];
                    skip = offers.length;
                    query = '{ offers (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryOffers = response.offers;
                    offers = offers.concat(queryOffers);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, offers];
            }
        });
    });
}
function getAllDealsPrimary(_timeLow, _timeHigh, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryOffers, offers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ deals (where: {timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } }';
                    queryService = new graph_1.Query('p2p-primary', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryOffers = response.deals;
                    offers = queryOffers;
                    _a.label = 2;
                case 2:
                    if (!(queryOffers.length >= 1000)) return [3 /*break*/, 4];
                    skip = offers.length;
                    query = '{ deals (where: {timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryOffers = response.deals;
                    offers = offers.concat(queryOffers);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, offers];
            }
        });
    });
}
function try_getRequestsPrimary(_timeLow, _timeHigh, token, url, retries) {
    if (retries === void 0) { retries = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var offers, error_24;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4 /*yield*/, getRequestsPrimary(_timeLow, _timeHigh, token, url)];
                case 1:
                    offers = _a.sent();
                    return [2 /*return*/, offers];
                case 2:
                    error_24 = _a.sent();
                    if (!(retries < 10)) return [3 /*break*/, 4];
                    retries++;
                    console.log("-- REINTENTO DE QUERY: " + retries);
                    return [4 /*yield*/, try_getRequestsPrimary(_timeLow, _timeHigh, token, url, retries + 1)];
                case 3:
                    offers = _a.sent();
                    console.log("-- REINTENTO EXITOSO --");
                    return [2 /*return*/, offers];
                case 4:
                    console.error(error_24);
                    throw new Error(error_24);
                case 5: return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getRequestsPrimary(_timeLow, _timeHigh, _tokensAddress, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryOffers, offers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ offers (where: {buyToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
                    queryService = new graph_1.Query('p2p-primary', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryOffers = response.offers;
                    offers = queryOffers;
                    _a.label = 2;
                case 2:
                    if (!(queryOffers.length >= 1000)) return [3 /*break*/, 4];
                    skip = offers.length;
                    query = '{ offers (where: {buyToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryOffers = response.offers;
                    offers = offers.concat(queryOffers);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, offers];
            }
        });
    });
}
function try_getCollectableOffers(_timeLow, _timeHigh, token, url, retries) {
    if (retries === void 0) { retries = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var offers, error_25;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4 /*yield*/, getCollectableOffers(_timeLow, _timeHigh, token, url)];
                case 1:
                    offers = _a.sent();
                    return [2 /*return*/, offers];
                case 2:
                    error_25 = _a.sent();
                    if (!(retries < 10)) return [3 /*break*/, 4];
                    retries++;
                    console.log("-- REINTENTO DE QUERY: " + retries);
                    return [4 /*yield*/, try_getCollectableOffers(_timeLow, _timeHigh, token, url, retries + 1)];
                case 3:
                    offers = _a.sent();
                    console.log("-- REINTENTO EXITOSO --");
                    return [2 /*return*/, offers];
                case 4:
                    console.error(error_25);
                    throw new Error(error_25);
                case 5: return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getCollectableOffers(_timeLow, _timeHigh, _tokensAddress, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryOffers, offers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ offerCommodities (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp sellId { tokenId metadata reference} } seller { id name } buyer { id name } buyAmount timestamp } } }';
                    queryService = new graph_1.Query('p2p', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryOffers = response.offerPackables;
                    offers = queryOffers;
                    _a.label = 2;
                case 2:
                    if (!(queryOffers.length >= 1000)) return [3 /*break*/, 4];
                    skip = offers.length;
                    query = '{ offerCommodities (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp sellId { tokenId metadata reference} } seller { id name } buyer { id name } buyAmount timestamp } } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryOffers = response.offerPackables;
                    offers = offers.concat(queryOffers);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, offers];
            }
        });
    });
}
function try_getCollectableOffersPrimary(_timeLow, _timeHigh, token, url, retries) {
    if (retries === void 0) { retries = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var offers, error_26;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4 /*yield*/, getCollectableOffersPrimary(_timeLow, _timeHigh, token, url)];
                case 1:
                    offers = _a.sent();
                    return [2 /*return*/, offers];
                case 2:
                    error_26 = _a.sent();
                    if (!(retries < 10)) return [3 /*break*/, 4];
                    retries++;
                    console.log("-- REINTENTO DE QUERY: " + retries);
                    return [4 /*yield*/, try_getCollectableOffersPrimary(_timeLow, _timeHigh, token, url, retries + 1)];
                case 3:
                    offers = _a.sent();
                    console.log("-- REINTENTO EXITOSO --");
                    return [2 /*return*/, offers];
                case 4:
                    console.error(error_26);
                    throw new Error(error_26);
                case 5: return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getCollectableOffersPrimary(_timeLow, _timeHigh, _tokensAddress, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryOffers, offers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ offerCommodities (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp sellId { tokenId metadata reference} } seller { id name } buyer { id name } buyAmount timestamp } } }';
                    queryService = new graph_1.Query('p2p-primary', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryOffers = response.offerPackables;
                    offers = queryOffers;
                    _a.label = 2;
                case 2:
                    if (!(queryOffers.length >= 1000)) return [3 /*break*/, 4];
                    skip = offers.length;
                    query = '{ offerCommodities (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp sellId { tokenId metadata reference} } seller { id name } buyer { id name } buyAmount timestamp } } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryOffers = response.offerPackables;
                    offers = offers.concat(queryOffers);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, offers];
            }
        });
    });
}
function try_getPackableOffers(_timeLow, _timeHigh, token, url, retries) {
    if (retries === void 0) { retries = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var offers, error_27;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4 /*yield*/, getPackableOffers(_timeLow, _timeHigh, token, url)];
                case 1:
                    offers = _a.sent();
                    return [2 /*return*/, offers];
                case 2:
                    error_27 = _a.sent();
                    if (!(retries < 10)) return [3 /*break*/, 4];
                    retries++;
                    console.log("-- REINTENTO DE QUERY: " + retries);
                    return [4 /*yield*/, try_getPackableOffers(_timeLow, _timeHigh, token, url, retries + 1)];
                case 3:
                    offers = _a.sent();
                    console.log("-- REINTENTO EXITOSO --");
                    return [2 /*return*/, offers];
                case 4:
                    console.error(error_27);
                    throw new Error(error_27);
                case 5: return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getPackableOffers(_timeLow, _timeHigh, _tokensAddress, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryOffers, offers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ offerPackables (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
                    queryService = new graph_1.Query('p2p', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryOffers = response.offerPackables;
                    offers = queryOffers;
                    _a.label = 2;
                case 2:
                    if (!(queryOffers.length >= 1000)) return [3 /*break*/, 4];
                    skip = offers.length;
                    query = '{ offerPackables (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryOffers = response.offerPackables;
                    offers = offers.concat(queryOffers);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, offers];
            }
        });
    });
}
function getAllPackableDeals(_timeLow, _timeHigh, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryOffers, offers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ dealPackables (where: {timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } }';
                    queryService = new graph_1.Query('p2p', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryOffers = response.dealPackables;
                    offers = queryOffers;
                    _a.label = 2;
                case 2:
                    if (!(queryOffers.length >= 1000)) return [3 /*break*/, 4];
                    skip = offers.length;
                    query = '{ dealPackables (where: {timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryOffers = response.dealPackables;
                    offers = offers.concat(queryOffers);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, offers];
            }
        });
    });
}
function try_getPackableRequests(_timeLow, _timeHigh, token, url, retries) {
    if (retries === void 0) { retries = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var offers, error_28;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4 /*yield*/, getPackableRequests(_timeLow, _timeHigh, token, url)];
                case 1:
                    offers = _a.sent();
                    return [2 /*return*/, offers];
                case 2:
                    error_28 = _a.sent();
                    if (!(retries < 10)) return [3 /*break*/, 4];
                    retries++;
                    console.log("-- REINTENTO DE QUERY: " + retries);
                    return [4 /*yield*/, try_getPackableRequests(_timeLow, _timeHigh, token, url, retries + 1)];
                case 3:
                    offers = _a.sent();
                    console.log("-- REINTENTO EXITOSO --");
                    return [2 /*return*/, offers];
                case 4:
                    console.error(error_28);
                    throw new Error(error_28);
                case 5: return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getPackableRequests(_timeLow, _timeHigh, _tokensAddress, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryOffers, offers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ offerPackables (where: {buyToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
                    queryService = new graph_1.Query('p2p', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryOffers = response.offerPackables;
                    offers = queryOffers;
                    _a.label = 2;
                case 2:
                    if (!(queryOffers.length >= 1000)) return [3 /*break*/, 4];
                    skip = offers.length;
                    query = '{ offerPackables (where: {buyToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryOffers = response.offerPackables;
                    offers = offers.concat(queryOffers);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, offers];
            }
        });
    });
}
function try_getPackableOffersPrimary(_timeLow, _timeHigh, token, url, retries) {
    if (retries === void 0) { retries = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var offers, error_29;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4 /*yield*/, getPackableOffersPrimary(_timeLow, _timeHigh, token, url)];
                case 1:
                    offers = _a.sent();
                    return [2 /*return*/, offers];
                case 2:
                    error_29 = _a.sent();
                    if (!(retries < 10)) return [3 /*break*/, 4];
                    retries++;
                    console.log("-- REINTENTO DE QUERY: " + retries);
                    return [4 /*yield*/, try_getPackableOffersPrimary(_timeLow, _timeHigh, token, url, retries + 1)];
                case 3:
                    offers = _a.sent();
                    console.log("-- REINTENTO EXITOSO --");
                    return [2 /*return*/, offers];
                case 4:
                    console.error(error_29);
                    throw new Error(error_29);
                case 5: return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getPackableOffersPrimary(_timeLow, _timeHigh, _tokensAddress, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryOffers, offers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ offerPackables (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
                    queryService = new graph_1.Query('p2p-primary', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryOffers = response.offerPackables;
                    offers = queryOffers;
                    _a.label = 2;
                case 2:
                    if (!(queryOffers.length >= 1000)) return [3 /*break*/, 4];
                    skip = offers.length;
                    query = '{ offerPackables (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryOffers = response.offerPackables;
                    offers = offers.concat(queryOffers);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, offers];
            }
        });
    });
}
function getAllPackableDealPrimary(_timeLow, _timeHigh, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryOffers, offers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ dealPackables (where: {timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } }';
                    queryService = new graph_1.Query('p2p-primary', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryOffers = response.dealPackables;
                    offers = queryOffers;
                    _a.label = 2;
                case 2:
                    if (!(queryOffers.length >= 1000)) return [3 /*break*/, 4];
                    skip = offers.length;
                    query = '{ dealPackables (where: {timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryOffers = response.dealPackables;
                    offers = offers.concat(queryOffers);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, offers];
            }
        });
    });
}
function try_getPackableRequestsPrimary(_timeLow, _timeHigh, token, url, retries) {
    if (retries === void 0) { retries = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var offers, error_30;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4 /*yield*/, getPackableRequestsPrimary(_timeLow, _timeHigh, token, url)];
                case 1:
                    offers = _a.sent();
                    return [2 /*return*/, offers];
                case 2:
                    error_30 = _a.sent();
                    if (!(retries < 10)) return [3 /*break*/, 4];
                    retries++;
                    console.log("-- REINTENTO DE QUERY: " + retries);
                    return [4 /*yield*/, try_getPackableRequestsPrimary(_timeLow, _timeHigh, token, url, retries + 1)];
                case 3:
                    offers = _a.sent();
                    console.log("-- REINTENTO EXITOSO --");
                    return [2 /*return*/, offers];
                case 4:
                    console.error(error_30);
                    throw new Error(error_30);
                case 5: return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getPackableRequestsPrimary(_timeLow, _timeHigh, _tokensAddress, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryOffers, offers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ offerPackables (where: {buyToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
                    queryService = new graph_1.Query('p2p-primary', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryOffers = response.offerPackables;
                    offers = queryOffers;
                    _a.label = 2;
                case 2:
                    if (!(queryOffers.length >= 1000)) return [3 /*break*/, 4];
                    skip = offers.length;
                    query = '{ offerPackables (where: {buyToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryOffers = response.offerPackables;
                    offers = offers.concat(queryOffers);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, offers];
            }
        });
    });
}
function getUserBalances(_nickname, _blockNumber, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var query, queryService, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = '{ name(id:"' + _nickname + '", block:{number: ' + _blockNumber + '}) { wallet { balances (where:{balance_gt:0 token_not_in:["0xed1bed970ab6798a38e93c2a025806b0304e4099", "0xe9889ef80eca8d8769c6dea852b599821336c359", "0xe3f8af7dc825cc072bf50f1ef12fbc8a8133709b" "0xd9a7f80cd3552e30b62168164bd04c3b8e5dfcc0", "0xd3ef3182d53add05ae74ef74d19a0c29beef99ab", "0xbe7a8d8c2a26a847bbde18a401066f196bf5657d", "0x89e4cabb8c5cdf6e49092c4cad4fa3af4c329914", "0x88a83a48bf4039023118ac760e6beaf5e6f110fb", "0x77f4ab4a154cf41c0b812f0873a3491dd39f478a", "0x7777079bc93ece8a66424aa6bbed0546ec20d06e", "0x6e5040f4ba7a6ec228a5247fe690d5df73539b83", "0x6e0c484e9efccf8d29ef229cc5b47b8b79ed8f97", "0x6645223d7947b4534f09dee35796e1c23326fc5b", "0x314c70a406f9b23b78924942508ddc93357fa6f2", "0x2b072f4f8c4c702330919e4fc3b0f9c279ea9f0c", "0x0de6a7d5d6c00ed86b57779193e91151fc5b3aa1", "0x09ca4aacd1cd443f6b4bf1b1003973e169b1a934", "0x0978c06f95711faa469f180bfc8aea5ec768b784", "0x079b9d78e64d8194d9a0f364e9fa73f6886ebfa9"]}) { token { id tokenSymbol tokenKind } balance packables { id balances (where:{balance_gt:0}) { balance packableId { metadata } } } } } } }';
                    queryService = new graph_1.Query('bank', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    if (response == undefined)
                        return [2 /*return*/, []];
                    return [2 /*return*/, response.name.wallet.balances];
            }
        });
    });
}
function getUserLastTxBeforeTime(_nickname, _timestamp, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var query, queryService, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = '{ name(id:"' + _nickname + '") { wallet { transactions (where:{timestamp_lt: ' + _timestamp + '} orderBy:timestamp, orderDirection:desc, first:1) { id } } } }';
                    queryService = new graph_1.Query('bank', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    if (response == undefined)
                        return [2 /*return*/, null];
                    return [2 /*return*/, response.name.wallet.transactions[0].id];
            }
        });
    });
}
function try_getDexDeals(_timeLow, _timeHigh, _instrument, _dex, _url, retries) {
    if (_url === void 0) { _url = 'mainnet'; }
    if (retries === void 0) { retries = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var deals, error_31;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4 /*yield*/, getDexDeals(_timeLow, _timeHigh, _instrument, _dex, _url)];
                case 1:
                    deals = _a.sent();
                    return [2 /*return*/, deals];
                case 2:
                    error_31 = _a.sent();
                    if (!(retries < 10)) return [3 /*break*/, 4];
                    retries++;
                    console.log("-- REINTENTO DE QUERY: " + retries);
                    return [4 /*yield*/, try_getDexDeals(_timeLow, _timeHigh, _instrument, _dex, _url, retries + 1)];
                case 3:
                    deals = _a.sent();
                    console.log("-- REINTENTO EXITOSO --");
                    return [2 /*return*/, deals];
                case 4:
                    console.error(error_31);
                    throw new Error(error_31);
                case 5: return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getDexDeals(_timeLow, _timeHigh, _instrument, _dex, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, stringArray, query, queryService, response, queryDeals, deals;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    stringArray = _instrument.join('", "');
                    query = '{ deals (first: 1000, skip: ' + skip + ', where:{tokenA_in:["' + stringArray + '"], tokenB_in:["' + stringArray + '"], timestamp_gte:' + _timeLow + ', timestamp_lte:' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc) { tokenA { id tokenSymbol } tokenB { id tokenSymbol } orderA { owner { id name } } orderB { owner { id name } } amountA amountB price side timestamp } }';
                    queryService = new graph_1.Query(_dex, _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryDeals = response.deals;
                    deals = queryDeals;
                    _a.label = 2;
                case 2:
                    if (!(queryDeals.length >= 1000)) return [3 /*break*/, 4];
                    skip = deals.length;
                    query = '{ deals (first: 1000, skip: ' + skip + ', where:{tokenA_in:["' + stringArray + '"], tokenB_in:["' + stringArray + '"], timestamp_gte:' + _timeLow + ', timestamp_lte:' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc) { tokenA { id tokenSymbol } tokenB { id tokenSymbol } orderA { owner { id name } } orderB { owner { id name } } amountA amountB price side timestamp } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryDeals = response.deals;
                    deals = deals.concat(queryDeals);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, deals];
            }
        });
    });
}
function getDexDealsByWallet(_timeLow, _timeHigh, _wallet, _dex, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryDeals, deals;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ user(id:"' + String(_wallet).toLowerCase() + '") { deals (first:1000, skip:' + skip + ', orderBy: timestamp, orderDirection:desc) { timestamp orderA { owner { id name } } orderB { owner { id name } } tokenA { id tokenSymbol } tokenB { id tokenSymbol } amountA amountB price side } } }';
                    queryService = new graph_1.Query(_dex, _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryDeals = response.user.deals;
                    deals = queryDeals;
                    _a.label = 2;
                case 2:
                    if (!(queryDeals.length >= 1000)) return [3 /*break*/, 4];
                    skip = deals.length;
                    query = '{ user(id:"' + String(_wallet).toLowerCase() + '") { deals (first:1000, skip:' + skip + ', orderBy: timestamp, orderDirection:desc) { timestamp orderA { owner { id name } } orderB { owner { id name } } tokenA { id tokenSymbol } tokenB { id tokenSymbol } amountA amountB price side } } }';
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryDeals = response.user.deals;
                    deals = deals.concat(queryDeals);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, deals];
            }
        });
    });
}
function getPiPrice(_timeLow, _timeHigh, _url) {
    if (_url === void 0) { _url = 'mainnet'; }
    return __awaiter(this, void 0, void 0, function () {
        var skip, query, queryService, response, queryPrices, prices, query_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = 0;
                    query = '{ prices (where: {timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '} orderBy: timestamp, orderDirection:asc, first: 1000, skip: ' + skip + ') { id supply collateral piPrice collateralPrice timestamp } }';
                    queryService = new graph_1.Query('piprice', _url);
                    queryService.setCustomQuery(query);
                    return [4 /*yield*/, queryService.request()];
                case 1:
                    response = _a.sent();
                    queryPrices = [];
                    if (response.prices != undefined) {
                        queryPrices = response.prices;
                    }
                    prices = queryPrices;
                    _a.label = 2;
                case 2:
                    if (!(queryPrices.length >= 1000)) return [3 /*break*/, 4];
                    skip = prices.length;
                    query_5 = '{ prices (where: {timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '} orderBy: timestamp, orderDirection:asc, first: 1000, skip: ' + skip + ') { id supply collateral piPrice collateralPrice timestamp } }';
                    queryService.setCustomQuery(query_5);
                    return [4 /*yield*/, queryService.request()];
                case 3:
                    response = _a.sent();
                    queryPrices = response.offerPackables;
                    prices = prices.concat(queryPrices);
                    return [3 /*break*/, 2];
                case 4: return [2 /*return*/, prices];
            }
        });
    });
}
function addTable(sheet, tableName, tablePosition, columns, rows) {
    sheet.addTable({
        name: tableName,
        ref: tablePosition,
        headerRow: true,
        totalsRow: true,
        style: {
            theme: 'TableStyleMedium1',
            showRowStripes: true
        },
        columns: columns,
        rows: rows
    });
}
function getTime() {
    return timeConverter(Date.now() / 1000);
}
function getUtcTime() {
    return Date.now() / 1000;
}
function getUtcTimeFromDate(year, month, day) {
    var timeDate = new Date(year, month - 1, day);
    var utcTime = timeDate.getTime() / 1000;
    return utcTime;
}
function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}
function getEmtpyDeal() {
    var rows = [];
    var array = [];
    array.push(new Date());
    array.push("");
    array.push("");
    array.push("");
    array.push("");
    array.push("");
    array.push(0);
    array.push(0);
    rows.push(array);
    return rows;
}
function getEmptyTransaction() {
    var rows = [];
    var array = [];
    array.push(new Date());
    array.push("");
    array.push("");
    array.push("");
    array.push(0);
    rows.push(array);
    return rows;
}
function getEndPointDates(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var year = a.getFullYear();
    var month = a.getMonth() + 1;
    var date = a.getDate();
    var dayAfter = +UNIX_timestamp + +ONE_UTC_DAY;
    var b = new Date(dayAfter * 1000);
    var toYear = b.getFullYear();
    var toMonth = b.getMonth() + 1;
    var toDate = b.getDate();
    var from = year + '-' + month + '-' + date;
    var to = toYear + '-' + toMonth + '-' + toDate;
    return [from, to];
}
function cleanEmptyDeals(array) {
    var cleanArray = [];
    for (var i = 0; i < array.length; i++) {
        if (array[i].deals.length > 0) {
            cleanArray.push(array[i]);
        }
    }
    return cleanArray;
}
function getDayRate(fromYear, fromMonth, toYear, toMonth, token, tokenCategory) {
    return __awaiter(this, void 0, void 0, function () {
        var from, to, responseData, rates, factor, i, len, j, error_32, dates, rates, responseData, i, len, j, rates2, rates3, j, error_33, from, to, response, rates, i, len, j, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!((fromYear == 2020) && (fromMonth < 11))) return [3 /*break*/, 1];
                    return [2 /*return*/, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
                case 1:
                    if (!((tokenCategory == 1) &&
                        (token != Constants.PI.address) &&
                        (token != Constants.USD.address) &&
                        (token != Constants.USC.address) &&
                        (token != Constants.PEL.address))) return [3 /*break*/, 6];
                    from = fromYear + "-" + fromMonth + "-01";
                    to = toYear + "-" + toMonth + "-01";
                    responseData = void 0;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, requestRateEndPoint(from, to, token)];
                case 3:
                    responseData = _a.sent();
                    rates = [];
                    factor = 1;
                    switch (token) {
                        case Constants.GLDX.address:
                            factor = 33.1034768;
                            break;
                        case Constants.GLDS.address:
                            factor = 33.1034768;
                            break;
                        default:
                            break;
                    }
                    for (i = 23; i < responseData.length; i = i + 24) {
                        if ((token == Constants.BTC.address) ||
                            (token == Constants.ETH.address) ||
                            (token == Constants.USDT.address)) {
                            rates.push(responseData[i].rate / factor);
                        }
                        else {
                            if (responseData[i].rate == 0) {
                                rates.push(0);
                            }
                            else {
                                rates.push((1 / (responseData[i].rate)) / factor);
                            }
                        }
                    }
                    len = 31 - rates.length;
                    if (len > 0) {
                        for (j = 0; j < len; j++) {
                            rates.push(0);
                        }
                    }
                    return [2 /*return*/, rates];
                case 4:
                    error_32 = _a.sent();
                    console.error(error_32);
                    throw new Error(error_32);
                case 5: return [3 /*break*/, 17];
                case 6:
                    if (!((token == Constants.USD.address) ||
                        (token == Constants.USC.address) ||
                        (token == Constants.PEL.address))) return [3 /*break*/, 7];
                    return [2 /*return*/, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];
                case 7:
                    if (!(token == Constants.PI.address)) return [3 /*break*/, 13];
                    dates = convertMonthAndYearToUTC(fromYear, fromMonth, toYear, toMonth);
                    rates = [];
                    _a.label = 8;
                case 8:
                    _a.trys.push([8, 11, , 12]);
                    return [4 /*yield*/, getPiPrice(dates[0], dates[1], 'mainnet')];
                case 9:
                    responseData = _a.sent();
                    for (i = 22; i < responseData.length; i = i + 24) {
                        rates.push(responseData[i].piPrice);
                    }
                    len = 31 - rates.length;
                    if (len > 0) {
                        for (j = 0; j < len; j++) {
                            rates.push(0);
                        }
                    }
                    return [4 /*yield*/, getDayRate(fromYear, fromMonth, toYear, toMonth, Constants.BTC.address, Constants.BTC.category)];
                case 10:
                    rates2 = _a.sent();
                    rates3 = [];
                    for (j = 0; j < rates.length; j++) {
                        rates3.push(rates[j] * rates2[j]);
                    }
                    return [2 /*return*/, rates3];
                case 11:
                    error_33 = _a.sent();
                    console.error(error_33);
                    throw new Error(error_33);
                case 12: return [3 /*break*/, 17];
                case 13:
                    from = fromYear + "-" + fromMonth + "-01";
                    to = toYear + "-" + toMonth + "-01";
                    _a.label = 14;
                case 14:
                    _a.trys.push([14, 16, , 17]);
                    return [4 /*yield*/, requestDataLake(token, from, to)];
                case 15:
                    response = _a.sent();
                    rates = [];
                    for (i = 0; i < response.length; i++) {
                        rates.push(response[i].close);
                    }
                    len = rates.length;
                    if (len < 31) {
                        for (j = 0; j < (31 - len); j++) {
                            rates.push(0);
                        }
                    }
                    else if (len > 31) {
                        rates.length = 31;
                    }
                    return [2 /*return*/, rates];
                case 16:
                    e_2 = _a.sent();
                    return [2 /*return*/, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
                case 17: return [2 /*return*/];
            }
        });
    });
}
function convertMonthAndYearToUTC(fromYear, fromMonth, toYear, toMonth) {
    var fromDate = new Date();
    fromDate.setFullYear(fromYear);
    fromDate.setMonth(fromMonth - 1);
    fromDate.setDate(1);
    fromDate.setHours(0);
    fromDate.setMinutes(0);
    fromDate.setSeconds(0);
    fromDate.setMilliseconds(0);
    var toDate = new Date();
    toDate.setFullYear(toYear);
    toDate.setMonth(toMonth - 1);
    toDate.setDate(1);
    toDate.setHours(0);
    toDate.setMinutes(0);
    toDate.setSeconds(0);
    toDate.setMilliseconds(0);
    return [Math.floor(fromDate.getTime() / 1000), Math.floor(toDate.getTime() / 1000)];
}
function convertToUsd(amount, token, timestamp) {
    return __awaiter(this, void 0, void 0, function () {
        var endPointDates, from, to, rates, rate, rates2, rate2, rates, rate, rate, factor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endPointDates = getEndPointDates(timestamp);
                    from = endPointDates[0];
                    to = endPointDates[1];
                    if (!(token == Constants.PI.address)) return [3 /*break*/, 5];
                    return [4 /*yield*/, getPiPrice(timestamp, (+timestamp + +ONE_UTC_DAY), 'mainnet')];
                case 1:
                    rates = _a.sent();
                    if (!(rates.length == 0)) return [3 /*break*/, 2];
                    return [2 /*return*/, 0];
                case 2:
                    rate = rates[rates.length - 1].piPrice;
                    return [4 /*yield*/, requestRateEndPoint(from, to, Constants.BTC.address)];
                case 3:
                    rates2 = _a.sent();
                    if (rates2.length == 0) {
                        return [2 /*return*/, 0];
                    }
                    else {
                        rate2 = rates2[rates2.length - 1].rate;
                        return [2 /*return*/, amount * rate * rate2];
                    }
                    _a.label = 4;
                case 4: return [2 /*return*/, 0];
                case 5:
                    if (!((token == Constants.USD.address) ||
                        (token == Constants.USC.address) ||
                        (token == Constants.PEL.address))) return [3 /*break*/, 6];
                    return [2 /*return*/, amount];
                case 6: return [4 /*yield*/, requestRateEndPoint(from, to, token)];
                case 7:
                    rates = _a.sent();
                    if (!(rates.length == 0)) return [3 /*break*/, 9];
                    return [4 /*yield*/, requestDataLake(token, from, to)];
                case 8:
                    rates = _a.sent();
                    if (rates == undefined)
                        return [2 /*return*/, 0];
                    rate = rates[rates.length - 1].open;
                    return [2 /*return*/, amount * rate];
                case 9:
                    rate = rates[rates.length - 1].rate;
                    factor = 1;
                    switch (token) {
                        case Constants.GLDX.address:
                            factor = 33.1034768;
                            break;
                        case Constants.GLDS.address:
                            factor = 33.1034768;
                            break;
                        default:
                            break;
                    }
                    if ((token == Constants.BTC.address) ||
                        (token == Constants.ETH.address) ||
                        (token == Constants.USDT.address)) {
                        rate = 1 / rate;
                    }
                    return [2 /*return*/, amount / (rate * factor)];
            }
        });
    });
}
function convertToUsdFromObj(amount, token, tokenKind, timestamp, ratesObj) {
    return __awaiter(this, void 0, void 0, function () {
        var day, date, fromMonth, fromYear, toMonth, toYear, _a, _b, rate;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    day = new Date(timestamp * 1000).getDate();
                    if (!(ratesObj[token] == undefined)) return [3 /*break*/, 2];
                    date = new Date(timestamp * 1000);
                    fromMonth = date.getMonth() + 1;
                    fromYear = date.getFullYear();
                    toMonth = 0;
                    toYear = fromYear;
                    if (fromMonth == 12) {
                        toMonth = 1;
                        fromYear++;
                    }
                    else {
                        toMonth = fromMonth + 1;
                    }
                    _a = ratesObj;
                    _b = token;
                    return [4 /*yield*/, getDayRate(fromYear, fromMonth, toYear, toMonth, token, tokenKind)];
                case 1:
                    _a[_b] = _c.sent();
                    _c.label = 2;
                case 2:
                    rate = ratesObj[token][day];
                    if ((rate == undefined) || (rate == 0))
                        return [2 /*return*/, 0];
                    return [2 /*return*/, amount * rate];
            }
        });
    });
}
function requestDataLake(token, from, to) {
    return __awaiter(this, void 0, void 0, function () {
        var parId, endPoint, body, response, responseData, error_34;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parId = Constants.INSTRUMENT_IDS[token];
                    if (parId == undefined)
                        return [2 /*return*/, [{ "open": 0, "close": 0, "volume": 0 }]];
                    endPoint = "https://api.pimarkets.io/v1/instrument/tickers/" + parId;
                    body = JSON.stringify({ "interval": "1day", "start_date": from, "end_date": to, "empty_candles": true });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, (0, node_fetch_1["default"])(endPoint, {
                            "method": 'POST',
                            "headers": {
                                "Accept": 'application/json',
                                'Content-Type': 'application/json'
                            },
                            "body": body,
                            "redirect": 'follow'
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    responseData = _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, responseData];
                case 5:
                    error_34 = _a.sent();
                    console.error(error_34);
                    throw new Error(error_34);
                case 6: return [2 /*return*/];
            }
        });
    });
}
function requestRateEndPoint(from, to, token, retries) {
    if (retries === void 0) { retries = 0; }
    return __awaiter(this, void 0, void 0, function () {
        var e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 6]);
                    return [4 /*yield*/, try_requestRateEndPoint(from, to, token)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    e_3 = _a.sent();
                    if (!(retries < 5)) return [3 /*break*/, 4];
                    console.log("-----REINTENTO: " + retries);
                    return [4 /*yield*/, requestRateEndPoint(from, to, token, retries + 1)];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    console.error(e_3);
                    throw new Error(e_3);
                case 5: return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function try_requestRateEndPoint(from, to, token) {
    return __awaiter(this, void 0, void 0, function () {
        var endPoint, body, response, responseData, error_35;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endPoint = "https://api.pimarkets.io/v1/public/asset/exchange/rates/history";
                    body = JSON.stringify({ "from": from, "to": to, "asset_id": token });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, (0, node_fetch_1["default"])(endPoint, {
                            "method": 'POST',
                            "headers": {
                                "Accept": 'application/json',
                                'Content-Type': 'application/json'
                            },
                            "body": body,
                            "redirect": 'follow'
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    responseData = _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, responseData];
                case 5:
                    error_35 = _a.sent();
                    console.error(error_35);
                    throw new Error(error_35);
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getUsersDataProtected(walletsArray, bearerToken, includeBanks) {
    if (includeBanks === void 0) { includeBanks = false; }
    return __awaiter(this, void 0, void 0, function () {
        var endPoint, body, response, responseData, error_36;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    endPoint = "https://api.pimarkets.io/v1/user/office/users-data";
                    body = JSON.stringify({ "wallets": walletsArray, "include_banks": includeBanks });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, (0, node_fetch_1["default"])(endPoint, {
                            "method": 'POST',
                            "headers": {
                                "Accept": 'application/json',
                                'Content-Type': 'application/json',
                                "Authorization": 'Bearer ' + bearerToken
                            },
                            "body": body,
                            "redirect": 'follow'
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    responseData = _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, responseData];
                case 5:
                    error_36 = _a.sent();
                    console.error(error_36);
                    throw new Error(error_36);
                case 6: return [2 /*return*/];
            }
        });
    });
}
var DealsReportData = /** @class */ (function () {
    function DealsReportData(tokenAddress, tokenSymbol, offers, requests) {
        this.tokenAddress = tokenAddress;
        this.tokenSymbol = tokenSymbol;
        this.offers = offers;
        this.requests = requests;
    }
    return DealsReportData;
}());
exports.DealsReportData = DealsReportData;
var HoldersReportData = /** @class */ (function () {
    function HoldersReportData(tokenAddress, tokenSymbol, holders, offers, expiry) {
        this.tokenAddress = tokenAddress;
        this.tokenSymbol = tokenSymbol;
        this.holders = holders;
        this.offers = offers;
        this.timestamp = getTime();
        if (expiry != undefined) {
            this.expiry = expiry;
        }
    }
    return HoldersReportData;
}());
exports.HoldersReportData = HoldersReportData;
