//import ExcelJS from 'exceljs';
const ExcelJS = require('exceljs');
import * as Constants from './constants';
import { Query, QueryTemplates } from './graph';
import { weiToEther } from './utils';
import fetch from 'node-fetch';
import { Blockchain } from './blockchain';
const FileSaver = require('file-saver');

const ONE_UTC_DAY = 86400;

export class Report {

    public url: string;

    constructor(
        url: string = 'mainnet'
    ) {
        this.url = url;
    }

    async getTransactionReportByArray(
        timeLow: number,
        timeHigh: number,
        tokensArray: any[],
        addressesArray: string[],
        hideNames: boolean = true
    ) {
        const workbook = new ExcelJS.Workbook();

        let promises: any = [];

        for (let i = 0; i < tokensArray.length; i++) {
            let sheet = workbook.addWorksheet(tokensArray[i].symbol);

            promises.push(setTransactionSheetByArray(
                sheet, 
                timeLow, 
                timeHigh, 
                addressesArray,
                this.url,
                tokensArray[i],
                hideNames
            ));
        }

        await Promise.all(promises);

        try {
            await workbook.xlsx.writeFile('PiMarketsTransactionsReport.xlsx');
        } catch (error) {
            let buffer = await workbook.xlsx.writeBuffer();
            
            try {
                await FileSaver.saveAs(new Blob([buffer]), 'PiMarketsTransactionsReport.xlsx');
            } catch (err) {
                console.error(err);
            }
        }
    }

    async getTransactionReportV2(
        monthIndex: number,
        year: number,
        tokensArray: any[],
        hideNames: boolean = true,
        name?: string
    ) {
        const workbook = new ExcelJS.Workbook();

        let toYear = year;
        let toMonthIndex = monthIndex + 1;

        if (monthIndex == 12) {
            toYear = year + 1;
            toMonthIndex = 1;
        }

        let timeLow = getUtcTimeFromDate(year, monthIndex, 1);
        let timeHigh = getUtcTimeFromDate(toYear, toMonthIndex, 1);

        let promises: any = [];

        for (let i = 0; i < tokensArray.length; i++) {
            let sheet = workbook.addWorksheet(tokensArray[i].symbol);

            promises.push(setTransactionSheet(
                sheet, 
                timeLow, 
                timeHigh, 
                monthIndex,
                year,
                toMonthIndex,
                toYear,
                this.url,
                tokensArray[i],
                hideNames,
                name
            ));
        }

        await Promise.all(promises);

        try {
            await workbook.xlsx.writeFile('PiMarketsTransactionsReportV2.xlsx');
        } catch (error) {
            let buffer = await workbook.xlsx.writeBuffer();
            
            try {
                await FileSaver.saveAs(new Blob([buffer]), 'PiMarketsTransactionsReportV2.xlsx');
            } catch (err) {
                console.error(err);
            }
        }
    }

    async getTransactionReport(
        timeLow: number,
        timeHigh: number,
        name?: string,
    ) {
        const workbook = new ExcelJS.Workbook();
        let sheet = workbook.addWorksheet("ALL_TXS");
        let transactions: any[];

        if (name == undefined) {
            transactions = await getAllTransactions(timeLow, timeHigh, this.url);
        } else {
            transactions = await getAllTransactionsByName(timeLow, timeHigh, name, this.url);
        }

        if (transactions.length > 0) {
            let rows = [];

            for (let j = 0; j < transactions.length; j++) {
                let array = [];
                
                array.push(new Date(transactions[j].timestamp * 1000));
                array.push(transactions[j].currency.tokenSymbol);
                array.push(transactions[j].from.id);

                if (transactions[j].from.name == null) {
                    array.push("");
                } else {
                    array.push(transactions[j].from.name.id);
                }

                array.push(transactions[j].to.id);

                if (transactions[j].to.name == null) {
                    array.push("");
                } else {
                    array.push(transactions[j].to.name.id);
                }

                array.push(parseFloat(weiToEther(transactions[j].amount)));
                /*let usdAmount = await convertToUsd(
                    parseFloat(weiToEther(transactions[j].amount)), 
                    transactions[j].currency.id,
                    transactions[j].timestamp
                );*/
                let usdAmount = 0;
                array.push(usdAmount);
                rows.push(array);
            }

            let tableName = 'Tabla';

            addTable(
                sheet,
                tableName,
                'B2',
                [
                    {name: 'Fecha', filterButton: true},
                    {name: 'Divisa'},
                    {name: 'Origen (wallet)'},
                    {name: 'Origen (usuario)', filterButton: true},
                    {name: 'Destino (wallet)'},
                    {name: 'Destino (usuario)', filterButton: true},
                    {name: 'Monto', totalsRowFunction: 'sum'},
                    {name: 'Monto (USD)', totalsRowFunction: 'sum'}
                ],
                rows
            );
        }

        try {
            await workbook.xlsx.writeFile('PiMarketsTransactionsReport.xlsx');
        } catch (error) {
            let buffer = await workbook.xlsx.writeBuffer();
            
            try {
                await FileSaver.saveAs(new Blob([buffer]), 'PiMarketsTransactionsReport.xlsx');
            } catch (err) {
                console.error(err);
            }
        }
    }

    async getTokenHoldersReport(
        orderBy: string,
        orderDirection: "desc" | "asc",
        tokensArray: any[],
        hideNames: boolean = true,
    ) {
        const first = 1000;
        let skip = 0;
        let queryTemplates = new QueryTemplates(this.url);
        const workbook = new ExcelJS.Workbook();
    
        for (let i = 0; i < tokensArray.length; i++) {
            skip = 0;
            let response = await queryTemplates.getTokenHolders(
                orderBy,
                orderDirection,
                first,
                skip,
                tokensArray[i].address
            );
    
            let loopresponse = response;
    
            while(loopresponse.length >= 1000) {
                skip = response.length;
                loopresponse = await queryTemplates.getTokenHolders(
                    orderBy,
                    orderDirection,
                    first,
                    skip,
                    tokensArray[i].address
                );
                response = response.concat(loopresponse);
            }
    
            let sheet = workbook.addWorksheet(tokensArray[i].symbol);
            sheet.getCell('B2').value = 'TOKEN';
            sheet.getCell('B3').value = 'FECHA';
            sheet.getCell('B2').font = {bold: true};
            sheet.getCell('B3').font = {bold: true};
            sheet.getCell('C2').value = tokensArray[i].symbol;
            sheet.getCell('C3').value = getTime();
            sheet.getCell('C6').value = 'HOLDERS';
            sheet.getCell('C6').font = {bold: true};
    
            let rows = [];
    
            for (let j = 0; j < response.length; j++) {
                let array = [];
                
                if (!hideNames) {
                    if (response[j].wallet.name == null) {
                        array.push("");
                    } else {
                        array.push(response[j].wallet.name.id);
                    }
                }
                
                array.push(response[j].wallet.id);
                array.push(parseFloat(weiToEther(response[j].balance)));
                rows.push(array);
            }
    
            let tableName = 'Tabla' + tokensArray[i].symbol;
    
            if (hideNames) {
                if (rows.length == 0) rows.push(["", 0]);
                await addTable(
                    sheet,
                    tableName,
                    'B7',
                    [
                        {name: 'Wallet', filterButton: true},
                        {name: 'Saldo', totalsRowFunction: 'sum'}
                    ],
                    rows
                );
            } else {
                if (rows.length == 0) rows.push(["", "", 0]);
                await addTable(
                    sheet,
                    tableName,
                    'B7',
                    [
                        {name: 'Nombre', filterButton: true},
                        {name: 'Wallet'},
                        {name: 'Saldo', totalsRowFunction: 'sum'}
                    ],
                    rows
                );
            }
    
            let skipOffers = 0;
    
            let offers = await queryTemplates.getOffers(
                'sellToken: "' + tokensArray[i].address + '", isOpen: true',
                'sellAmount',
                'desc',
                1000,
                skipOffers
            );
    
            let loopOffers = offers;
    
            while(loopOffers.length >= 1000) {
                skipOffers = offers.length;
                offers = await queryTemplates.getOffers(
                    'sellToken: "' + tokensArray[i].address + '", isOpen: true',
                    'sellAmount',
                    'desc',
                    1000,
                    skipOffers
                );
                offers = offers.concat(loopOffers);
            }
    
            if (offers.length > 0) {
                sheet.getCell('G6').value = 'OFERTAS P2P';
                sheet.getCell('G6').font = {bold: true};
                let rows2 = [];
    
                for (let k = 0; k < offers.length; k++) {
                    let array2 = [];
                    if (hideNames) {
                        array2.push(offers[k].owner.id);
                    } else {
                        array2.push(offers[k].owner.name);
                    }
                    
                    array2.push(parseFloat(weiToEther(offers[k].sellAmount)));
                    rows2.push(array2);
                }
    
                let tableName2 = 'P2P' + tokensArray[i].symbol;
    
                await addTable(
                    sheet,
                    tableName2,
                    'F7',
                    [
                        {name: 'Wallet', filterButton: true},
                        {name: 'Cantidad ofertada', totalsRowFunction: 'sum'}
                    ],
                    rows2
                );
            }
        }
    
        try {
            await workbook.xlsx.writeFile('PiMarketsTokenHoldersReport.xlsx');
        } catch (error) {
            let buffer = await workbook.xlsx.writeBuffer();
            
            try {
                await FileSaver.saveAs(new Blob([buffer]), 'PiMarketsTokenHoldersReport.xlsx');
            } catch (err) {
                console.error(err);
            }
        }
    }

    async getTokenHoldersReportInArray(
        orderBy: string,
        orderDirection: "desc" | "asc",
        tokensArray: any[],
        holdersArray: string[],
        hideNames: boolean = true,
    ) {
        const first = 1000;
        let skip = 0;
        let queryTemplates = new QueryTemplates(this.url);
        const workbook = new ExcelJS.Workbook();
    
        for (let i = 0; i < tokensArray.length; i++) {
            skip = 0;
            let response = await queryTemplates.getTokenHoldersInArray(
                orderBy,
                orderDirection,
                first,
                skip,
                tokensArray[i].address,
                holdersArray
            );
    
            let loopresponse = response;
    
            while(loopresponse.length >= 1000) {
                skip = response.length;
                loopresponse = await queryTemplates.getTokenHoldersInArray(
                    orderBy,
                    orderDirection,
                    first,
                    skip,
                    tokensArray[i].address,
                    holdersArray
                );
                response = response.concat(loopresponse);
            }
    
            let sheet = workbook.addWorksheet(tokensArray[i].symbol);
            sheet.getCell('B2').value = 'TOKEN';
            sheet.getCell('B3').value = 'FECHA';
            sheet.getCell('B2').font = {bold: true};
            sheet.getCell('B3').font = {bold: true};
            sheet.getCell('C2').value = tokensArray[i].symbol;
            sheet.getCell('C3').value = getTime();
            sheet.getCell('C6').value = 'HOLDERS';
            sheet.getCell('C6').font = {bold: true};
    
            let rows = [];
    
            for (let j = 0; j < response.length; j++) {
                let array = [];
                
                if (!hideNames) {
                    if (response[j].wallet.name == null) {
                        array.push("");
                    } else {
                        array.push(response[j].wallet.name.id);
                    }
                }
                
                array.push(response[j].wallet.id);
                array.push(parseFloat(weiToEther(response[j].balance)));
                rows.push(array);
            }
    
            let tableName = 'Tabla' + tokensArray[i].symbol;
    
            if (hideNames) {
                if (rows.length == 0) rows.push(["", 0]);
                await addTable(
                    sheet,
                    tableName,
                    'B7',
                    [
                        {name: 'Wallet', filterButton: true},
                        {name: 'Saldo', totalsRowFunction: 'sum'}
                    ],
                    rows
                );
            } else {
                if (rows.length == 0) rows.push(["", "", 0]);
                await addTable(
                    sheet,
                    tableName,
                    'B7',
                    [
                        {name: 'Nombre', filterButton: true},
                        {name: 'Wallet'},
                        {name: 'Saldo', totalsRowFunction: 'sum'}
                    ],
                    rows
                );
            }
        }
    
        try {
            await workbook.xlsx.writeFile('PiMarketsTokenHoldersReport.xlsx');
        } catch (error) {
            let buffer = await workbook.xlsx.writeBuffer();
            
            try {
                await FileSaver.saveAs(new Blob([buffer]), 'PiMarketsTokenHoldersReport.xlsx');
            } catch (err) {
                console.error(err);
            }
        }
    }

    async getPackableHoldersReport(
        orderBy: string,
        orderDirection: "desc" | "asc",
        tokensArray: any[],
        expiries: any[],
        hideNames: boolean = true,
    ) {
        const first = 1000;
        let skip = 0;
        let queryTemplates = new QueryTemplates(this.url);
        const workbook = new ExcelJS.Workbook();
    
        for (let i = 0; i < tokensArray.length; i++) {
            let response = await queryTemplates.getPackableHolders(
                tokensArray[i].address,
                expiries[i][1],
                orderBy,
                orderDirection,
                first,
                skip
            );
    
            let loopresponse = response;
    
            while(loopresponse.length >= 1000) {
                skip = response.length;
                loopresponse = await queryTemplates.getPackableHolders(
                    tokensArray[i].address,
                    expiries[i][1],
                    orderBy,
                    orderDirection,
                    first,
                    skip
                );
                response = response.concat(loopresponse);
            }
    
            let sheet = workbook.addWorksheet(tokensArray[i].symbol + '-' + expiries[i][0]);
            sheet.getCell('B2').value = 'TOKEN';
            sheet.getCell('B3').value = 'VENCIMIENTO';
            sheet.getCell('B4').value = 'FECHA';
            sheet.getCell('B2').font = {bold: true};
            sheet.getCell('B3').font = {bold: true};
            sheet.getCell('B4').font = {bold: true};
            sheet.getCell('C2').value = tokensArray[i].symbol;
            sheet.getCell('C3').value = expiries[i][0];
            sheet.getCell('C4').value = getTime();
            sheet.getCell('C6').value = 'HOLDERS';
            sheet.getCell('C6').font = {bold: true};
    
            let rows = [];

            let namesAllowed = false;

                if (
                    (tokensArray[i].address == Constants.A.address) ||
                    (tokensArray[i].address == Constants.B.address) ||
                    (tokensArray[i].address == Constants.C.address) ||
                    (tokensArray[i].address == Constants.D.address) ||
                    (tokensArray[i].address == Constants.F.address)
                ) {
                    namesAllowed = true;
                }
    
            for (let j = 0; j < response.length; j++) {
                let array = [];

                if ((!hideNames) || namesAllowed) {
                    if (response[j].wallet.name == null) {
                        array.push("");
                    } else {
                        array.push(response[j].wallet.name.id);
                    }
                }
                
                array.push(response[j].wallet.id);
                array.push(parseInt(weiToEther(response[j].balance)));
                rows.push(array);
            }
    
            let tableName = 'Tabla' + tokensArray[i].symbol + expiries[i][0];
    
            if ((hideNames) && !namesAllowed) {
                if (rows.length == 0) rows.push(["", 0]);
                await addTable(
                    sheet,
                    tableName,
                    'B7',
                    [
                        {name: 'Wallet', filterButton: true},
                        {name: 'Saldo', totalsRowFunction: 'sum'}
                    ],
                    rows
                );
            } else {
                if (rows.length == 0) rows.push(["", "", 0]);
                await addTable(
                    sheet,
                    tableName,
                    'B7',
                    [
                        {name: 'Nombre', filterButton: true},
                        {name: 'Wallet'},
                        {name: 'Saldo', totalsRowFunction: 'sum'}
                    ],
                    rows
                );
            }
    
            let skipOffers = 0;
    
            let offers = await queryTemplates.getPackableOffers(
                'sellToken: "' + tokensArray[i].address + '", sellId: "' + expiries[i][1] + '", isOpen: true',
                'sellAmount',
                'desc',
                1000,
                skipOffers
            );
    
            let loopOffers = offers;
    
            while(loopOffers.length >= 1000) {
                skipOffers = offers.length;
                offers = await queryTemplates.getPackableOffers(
                    'sellToken: "' + tokensArray[i].address + '", sellId: "' + expiries[i][1] + '", isOpen: true',
                    'sellAmount',
                    'desc',
                    1000,
                    skipOffers
                );
                offers = offers.concat(loopOffers);
            }
    
            if (offers.length > 0) {
                sheet.getCell('F6').value = 'NOTA: Si no coincide el saldo de Mercado P2P con el total ofertado hay que ver pactos pendientes';
                sheet.getCell('F6').font = {color: {argb: "ff0000"}};
                sheet.getCell('G5').value = 'OFERTAS P2P';
                sheet.getCell('G5').font = {bold: true};
                let rows2 = [];
    
                for (let k = 0; k < offers.length; k++) {
                    let array2 = [];
                    if (hideNames) {
                        array2.push(offers[k].owner.id);
                    } else {
                        array2.push(offers[k].owner.name);
                    }
                    array2.push(parseInt(weiToEther(offers[k].sellAmount)));
                    rows2.push(array2);
                }
    
                let tableName2 = 'P2P' + tokensArray[i].symbol;
    
                await addTable(
                    sheet,
                    tableName2,
                    'F7',
                    [
                        {name: 'Wallet', filterButton: true},
                        {name: 'Cantidad ofertada', totalsRowFunction: 'sum'}
                    ],
                    rows2
                );
            }
        }
    
        try {
            await workbook.xlsx.writeFile('PiMarketsPackableHoldersReport.xlsx');
        } catch (error) {
            let buffer = await workbook.xlsx.writeBuffer();
            
            try {
                await FileSaver.saveAs(new Blob([buffer]), 'PiMarketsPackableHoldersReport.xlsx');
            } catch (err) {
                console.error(err);
            }
        }
    }

    async getPackableHoldersReportInArray(
        orderBy: string,
        orderDirection: "desc" | "asc",
        tokensArray: any[],
        expiries: any[],
        holdersArray: string[],
        hideNames: boolean = true,
    ) {
        const first = 1000;
        let skip = 0;
        let queryTemplates = new QueryTemplates(this.url);
        const workbook = new ExcelJS.Workbook();
    
        for (let i = 0; i < tokensArray.length; i++) {
            let response = await queryTemplates.getPackableHoldersInArray(
                tokensArray[i].address,
                expiries[i][1],
                orderBy,
                orderDirection,
                first,
                skip,
                holdersArray
            );
    
            let loopresponse = response;
    
            while(loopresponse.length >= 1000) {
                skip = response.length;
                loopresponse = await queryTemplates.getPackableHoldersInArray(
                    tokensArray[i].address,
                    expiries[i][1],
                    orderBy,
                    orderDirection,
                    first,
                    skip,
                    holdersArray
                );
                response = response.concat(loopresponse);
            }
    
            let sheet = workbook.addWorksheet(tokensArray[i].symbol + '-' + expiries[i][0]);
            sheet.getCell('B2').value = 'TOKEN';
            sheet.getCell('B3').value = 'VENCIMIENTO';
            sheet.getCell('B4').value = 'FECHA';
            sheet.getCell('B2').font = {bold: true};
            sheet.getCell('B3').font = {bold: true};
            sheet.getCell('B4').font = {bold: true};
            sheet.getCell('C2').value = tokensArray[i].symbol;
            sheet.getCell('C3').value = expiries[i][0];
            sheet.getCell('C4').value = getTime();
            sheet.getCell('C6').value = 'HOLDERS';
            sheet.getCell('C6').font = {bold: true};
    
            let rows = [];

            let namesAllowed = false;

                if (
                    (tokensArray[i].address == Constants.A.address) ||
                    (tokensArray[i].address == Constants.B.address) ||
                    (tokensArray[i].address == Constants.C.address) ||
                    (tokensArray[i].address == Constants.D.address) ||
                    (tokensArray[i].address == Constants.F.address)
                ) {
                    namesAllowed = true;
                }
    
            for (let j = 0; j < response.length; j++) {
                let array = [];

                if ((!hideNames) || namesAllowed) {
                    if (response[j].wallet.name == null) {
                        array.push("");
                    } else {
                        array.push(response[j].wallet.name.id);
                    }
                }
                
                array.push(response[j].wallet.id);
                array.push(parseInt(weiToEther(response[j].balance)));
                rows.push(array);
            }
    
            let tableName = 'Tabla' + tokensArray[i].symbol + expiries[i][0];
    
            if ((hideNames) && !namesAllowed) {
                if (rows.length == 0) rows.push(["", 0]);
                await addTable(
                    sheet,
                    tableName,
                    'B7',
                    [
                        {name: 'Wallet', filterButton: true},
                        {name: 'Saldo', totalsRowFunction: 'sum'}
                    ],
                    rows
                );
            } else {
                if (rows.length == 0) rows.push(["", "", 0]);
                await addTable(
                    sheet,
                    tableName,
                    'B7',
                    [
                        {name: 'Nombre', filterButton: true},
                        {name: 'Wallet'},
                        {name: 'Saldo', totalsRowFunction: 'sum'}
                    ],
                    rows
                );
            }
        }
    
        try {
            await workbook.xlsx.writeFile('PiMarketsPackableHoldersReport.xlsx');
        } catch (error) {
            let buffer = await workbook.xlsx.writeBuffer();
            
            try {
                await FileSaver.saveAs(new Blob([buffer]), 'PiMarketsPackableHoldersReport.xlsx');
            } catch (err) {
                console.error(err);
            }
        }
    }

    async getCollectableHoldersReport(
        orderBy: string,
        orderDirection: "desc" | "asc",
        tokensArray: any[]
    ) {
        const first = 1000;
        let skip = 0;
        let queryTemplates = new QueryTemplates(this.url);
        const workbook = new ExcelJS.Workbook();
    
        for (let i = 0; i < tokensArray.length; i++) {
            let response = await queryTemplates.getNFTHolders(
                orderBy,
                orderDirection,
                first,
                skip,
                tokensArray[i].address
            );
    
            let loopresponse = response;
    
            while(loopresponse.length >= 1000) {
                skip = response.length;
                response = await queryTemplates.getNFTHolders(
                    orderBy,
                    orderDirection,
                    first,
                    skip,
                    tokensArray[i].address
                );
                response = response.concat(loopresponse);
            }
    
            let sheet = workbook.addWorksheet(tokensArray[i].symbol);
            sheet.getCell('B2').value = 'TOKEN';
            sheet.getCell('B3').value = 'FECHA';
            sheet.getCell('B2').font = {bold: true};
            sheet.getCell('B3').font = {bold: true};
            sheet.getCell('C2').value = tokensArray[i].symbol;
            sheet.getCell('C3').value = getTime();
            sheet.getCell('C6').value = 'HOLDERS';
            sheet.getCell('C6').font = {bold: true};
    
            let rows = [];
    
            for (let j = 0; j < response.length; j++) {
                let array = [];
                
                if (response[j].wallet.name == null) {
                    array.push("");
                } else {
                    array.push(response[j].wallet.name.id);
                }
                
                array.push(response[j].wallet.id);
                array.push(parseFloat(weiToEther(response[j].balance)));
                rows.push(array);
            }
    
            let tableName = 'Tabla' + tokensArray[i].symbol;
    
            await addTable(
                sheet,
                tableName,
                'B7',
                [
                    {name: 'Nombre', filterButton: true},
                    {name: 'Wallet'},
                    {name: 'Saldo', totalsRowFunction: 'sum'}
                ],
                rows
            );
    
            let skipOffers = 0;
    
            let offers = await queryTemplates.getNFTOffers(
                'sellToken: "' + tokensArray[i].address + '", isOpen: true',
                'timestamp',
                'desc',
                1000,
                skipOffers
            );
    
            let loopOffers = offers;
    
            while(loopOffers.length >= 1000) {
                skipOffers = offers.length;
                offers = await queryTemplates.getNFTOffers(
                    'sellToken: "' + tokensArray[i].address + '", isOpen: true',
                    'timestamp',
                    'desc',
                    1000,
                    skipOffers
                );
                offers = offers.concat(loopOffers);
            }
    
            if (offers.length > 0) {
                sheet.getCell('G6').value = 'OFERTAS P2P';
                sheet.getCell('G6').font = {bold: true};
                let rows2 = [];
    
                for (let k = 0; k < offers.length; k++) {
                    let array2 = [];
                    array2.push(offers[k].owner.name);
                    array2.push(offers[k].owner.id);
                    array2.push(parseInt(weiToEther(offers[k].sellAmount)));
                    rows2.push(array2);
                }
    
                let tableName2 = 'P2P' + tokensArray[i].symbol;
    
                await addTable(
                    sheet,
                    tableName2,
                    'F7',
                    [
                        {name: 'Dueño de la oferta', filterButton: true},
                        {name: 'Wallet'},
                        {name: 'Cantidad ofertada', totalsRowFunction: 'sum'}
                    ],
                    rows2
                );
            }
        }

        try {
            await workbook.xlsx.writeFile('PiMarketsCollectableHoldersReport.xlsx');
        } catch (error) {
            let buffer = await workbook.xlsx.writeBuffer();
            
            try {
                await FileSaver.saveAs(new Blob([buffer]), 'PiMarketsCollectableHoldersReport.xlsx');
            } catch (err) {
                console.error(err);
            }
        }
    }

    async getTokenDealsReportV2(
        monthIndex: number,
        year: number,
        tokensArray: any[],
        hideNames: boolean = true,
    ) {
        const workbook = new ExcelJS.Workbook();

        let toYear = year;
        let toMonthIndex = monthIndex + 1;

        if (monthIndex == 12) {
            toYear = year + 1;
            toMonthIndex = 1;
        }

        let timeLow = getUtcTimeFromDate(year, monthIndex, 1);
        let timeHigh = getUtcTimeFromDate(toYear, toMonthIndex, 1);

        let promises: any = [];

        for (let i = 0; i < tokensArray.length; i++) {
            //2 sheets per token (1 per market)
            let sheet = workbook.addWorksheet(tokensArray[i].symbol + '2°');
            let sheet2 = workbook.addWorksheet(tokensArray[i].symbol + '1°');

            promises.push(setTokenDealsSheet(
                sheet, 
                timeLow, 
                timeHigh, 
                monthIndex,
                year,
                toMonthIndex,
                toYear,
                this.url,
                tokensArray[i],
                hideNames
            ));

            promises.push(setPrimaryTokenDealsSheet(
                sheet2, 
                timeLow, 
                timeHigh, 
                monthIndex,
                year,
                toMonthIndex,
                toYear,
                this.url,
                tokensArray[i],
                hideNames
            ));
        }

        await Promise.all(promises);

        try {
            await workbook.xlsx.writeFile('PiMarketsTokenDealsReportV2.xlsx');
        } catch (error) {
            let buffer = await workbook.xlsx.writeBuffer();
            
            try {
                await FileSaver.saveAs(new Blob([buffer]), 'PiMarketsTokenDealsReportV2.xlsx');
            } catch (err) {
                console.error(err);
            }
        }
    }

    async getTokenDealsReport(
        timeLow: number,
        timeHigh: number
    ) {
        const workbook = new ExcelJS.Workbook();

        let sheet = workbook.addWorksheet('ALL_TOKEN_DEALS');
        let deals = await getAllDeals(timeLow, timeHigh, this.url);
        let dealsPrimary = await getAllDealsPrimary(timeLow, timeHigh, this.url);

        let rows = [];
        let nextDeal: any;

        while ((deals.length > 0) || (dealsPrimary.length > 0)) {
            
            let nextDealTimestamp = 0;
            if (deals.length > 0) {
                nextDealTimestamp = deals[deals.length - 1].timestamp;
            }

            let nextDealPrimaryTimestamp = 0;
            if (dealsPrimary.length > 0) {
                nextDealPrimaryTimestamp = dealsPrimary[dealsPrimary.length - 1].timestamp;
            }

            if ((nextDealTimestamp != 0) && (nextDealPrimaryTimestamp != 0)) {
                if (nextDealTimestamp < nextDealPrimaryTimestamp) {
                    nextDeal = deals.pop();
                } else {
                    nextDeal = dealsPrimary.pop();
                }
            } else if (nextDealTimestamp == 0) {
                nextDeal = dealsPrimary.pop();
            } else if (nextDealPrimaryTimestamp == 0) {
                nextDeal = deals.pop();
            }

            let array = [];

            array.push(new Date(nextDeal.timestamp * 1000));
            array.push(timeConverter(nextDeal.offer.timestamp));
            array.push(timeConverter(nextDeal.timestamp));
            array.push(nextDeal.offer.sellToken.tokenSymbol);
            array.push(nextDeal.offer.buyToken.tokenSymbol);

            if (nextDeal.seller.name == null) {
                array.push("");
            } else {
                array.push(nextDeal.seller.name);
            }

            if (nextDeal.buyer.name == null) {
                array.push("");
            } else {
                array.push(nextDeal.buyer.name);
            }

            array.push(parseFloat(weiToEther(nextDeal.sellAmount)));
            array.push(parseFloat(weiToEther(nextDeal.buyAmount)));
            rows.push(array);
        }

        let tableName = 'Tabla';

        await addTable(
            sheet,
            tableName,
            'B3',
            [
                {name: 'Fecha (pacto)', filterButton: true},
                {name: 'Hora (oferta)'},
                {name: 'Hora (pacto)'},
                {name: 'Oferta', filterButton: true},
                {name: 'Contrapartida', filterButton: true},
                {name: 'Vendedor (usuario)', filterButton: true},
                {name: 'Comprador (usuario)', filterButton: true},
                {name: 'Monto pactado ', totalsRowFunction: 'sum'},
                {name: 'Monto contrapartida', totalsRowFunction: 'sum'}
            ],
            rows
        );

        try {
            await workbook.xlsx.writeFile('PiMarketsTokenDealsReport.xlsx');
        } catch (error) {
            let buffer = await workbook.xlsx.writeBuffer();
            
            try {
                await FileSaver.saveAs(new Blob([buffer]), 'PiMarketsTokenDealsReport.xlsx');
            } catch (err) {
                console.error(err);
            }
        }
    }

    async getDealsReport(
        timeLow: number,
        timeHigh: number
    ) {
        const workbook = new ExcelJS.Workbook();

        let sheet = workbook.addWorksheet('ALL_DEALS');
        let deals = await getAllDeals(timeLow, timeHigh, this.url);
        let dealsPrimary = await getAllDealsPrimary(timeLow, timeHigh, this.url);
        let dealsPack = await getAllPackableDeals(timeLow, timeHigh, this.url);
        let dealsPrimaryPack = await getAllPackableDealPrimary(timeLow, timeHigh, this.url);

        let rows = [];
        let nextDeal: any;

        while ((deals.length > 0) || (dealsPrimary.length > 0) || (dealsPack.length > 0) || (dealsPrimaryPack.length > 0)) {
            let _array: number[] = [];

            let nextDealTimestamp = timeHigh;
            if (deals.length > 0) {
                nextDealTimestamp = deals[deals.length - 1].timestamp;
            }

            let nextDealPrimaryTimestamp = timeHigh;
            if (dealsPrimary.length > 0) {
                nextDealPrimaryTimestamp = dealsPrimary[dealsPrimary.length - 1].timestamp;
            }

            let nextDealPackTimestamp = timeHigh;
            if (dealsPack.length > 0) {
                nextDealPackTimestamp = dealsPack[dealsPack.length - 1].timestamp;
            }

            let nextDealPrimaryPackTimestamp = timeHigh;
            if (dealsPrimaryPack.length > 0) {
                nextDealPrimaryPackTimestamp = dealsPrimaryPack[dealsPrimaryPack.length - 1].timestamp;
            }

            _array.push(nextDealTimestamp)
            _array.push(nextDealPrimaryTimestamp)
            _array.push(nextDealPackTimestamp)
            _array.push(nextDealPrimaryPackTimestamp)

            let index = 0;
            let min = _array[0];
            for (let i = 1; i < _array.length; i++) {
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

            let array = [];

            array.push(new Date(nextDeal.timestamp * 1000));
            array.push(timeConverter(nextDeal.offer.timestamp));
            array.push(timeConverter(nextDeal.timestamp));
            array.push(nextDeal.offer.sellToken.tokenSymbol);
            array.push(nextDeal.offer.buyToken.tokenSymbol);

            if (nextDeal.seller.name == null) {
                array.push("");
            } else {
                array.push(nextDeal.seller.name);
            }

            array.push(nextDeal.seller.id)

            if (nextDeal.buyer.name == null) {
                array.push("");
            } else {
                array.push(nextDeal.buyer.name);
            }

            array.push(nextDeal.buyer.id)

            array.push(parseFloat(weiToEther(nextDeal.sellAmount)));
            array.push(parseFloat(weiToEther(nextDeal.buyAmount)));
            rows.push(array);
        }

        let tableName = 'Tabla';

        await addTable(
            sheet,
            tableName,
            'B3',
            [
                {name: 'Fecha (pacto)', filterButton: true},
                {name: 'Hora (oferta)'},
                {name: 'Hora (pacto)'},
                {name: 'Oferta', filterButton: true},
                {name: 'Contrapartida', filterButton: true},
                {name: 'Vendedor (usuario)', filterButton: true},
                {name: 'Vendedor (wallet)', filterButton: true},
                {name: 'Comprador (usuario)', filterButton: true},
                {name: 'Comprador (wallet)', filterButton: true},
                {name: 'Monto pactado ', totalsRowFunction: 'sum'},
                {name: 'Monto contrapartida', totalsRowFunction: 'sum'}
            ],
            rows
        );

        try {
            await workbook.xlsx.writeFile('PiMarketsDealsReport.xlsx');
        } catch (error) {
            let buffer = await workbook.xlsx.writeBuffer();
            
            try {
                await FileSaver.saveAs(new Blob([buffer]), 'PiMarketsDealsReport.xlsx');
            } catch (err) {
                console.error(err);
            }
        }
    }

    async getPackableDealsReportV2(
        monthIndex: number,
        year: number,
        tokensArray: any[],
        hideNames: boolean = true,
    ) {
        const workbook = new ExcelJS.Workbook();

        let toYear = year;
        let toMonthIndex = monthIndex + 1;

        if (monthIndex == 12) {
            toYear = year + 1;
            toMonthIndex = 1;
        }

        let timeLow = getUtcTimeFromDate(year, monthIndex, 1);
        let timeHigh = getUtcTimeFromDate(toYear, toMonthIndex, 1);

        let promises: any = [];

        for (let i = 0; i < tokensArray.length; i++) {
            //2 sheets per token (1 per market)
            let sheet = workbook.addWorksheet(tokensArray[i].symbol + '2°');
            let sheet2 = workbook.addWorksheet(tokensArray[i].symbol + '1°');

            promises.push(setPackableDealsSheet(
                sheet, 
                timeLow, 
                timeHigh, 
                this.url,
                tokensArray[i],
                hideNames
            ));

            promises.push(setPrimaryPackableDealsSheet(
                sheet2, 
                timeLow, 
                timeHigh, 
                this.url,
                tokensArray[i],
                hideNames
            ));
        }

        await Promise.all(promises);

        try {
            await workbook.xlsx.writeFile('PiMarketsPackableDealsReportV2.xlsx');
        } catch (error) {
            let buffer = await workbook.xlsx.writeBuffer();
            
            try {
                await FileSaver.saveAs(new Blob([buffer]), 'PiMarketsPackableDealsReportV2.xlsx');
            } catch (err) {
                console.error(err);
            }
        }
    }

    async getPackableDealsReport(
        timeLow: number,
        timeHigh: number
    ) {
        const workbook = new ExcelJS.Workbook();

        let sheet = workbook.addWorksheet('ALL_PACKABLE_DEALS');
        let deals = await getAllPackableDeals(timeLow, timeHigh, this.url);
        let dealsPrimary = await getAllPackableDealPrimary(timeLow, timeHigh, this.url);

        let rows = [];
        let nextDeal: any;

        while ((deals.length > 0) || (dealsPrimary.length > 0)) {
            
            let nextDealTimestamp = 0;
            if (deals.length > 0) {
                nextDealTimestamp = deals[deals.length - 1].timestamp;
            }

            let nextDealPrimaryTimestamp = 0;
            if (dealsPrimary.length > 0) {
                nextDealPrimaryTimestamp = dealsPrimary[dealsPrimary.length - 1].timestamp;
            }

            if ((nextDealTimestamp != 0) && (nextDealPrimaryTimestamp != 0)) {
                if (nextDealTimestamp < nextDealPrimaryTimestamp) {
                    nextDeal = deals.pop();
                } else {
                    nextDeal = dealsPrimary.pop();
                }
            } else if (nextDealTimestamp == 0) {
                nextDeal = dealsPrimary.pop();
            } else if (nextDealPrimaryTimestamp == 0) {
                nextDeal = deals.pop();
            }

            let array = [];

            array.push(new Date(nextDeal.timestamp * 1000));
            array.push(timeConverter(nextDeal.offer.timestamp));
            array.push(timeConverter(nextDeal.timestamp));
            array.push(nextDeal.offer.sellToken.tokenSymbol);
            array.push(nextDeal.offer.buyToken.tokenSymbol);

            if (nextDeal.seller.name == null) {
                array.push("");
            } else {
                array.push(nextDeal.seller.name);
            }

            if (nextDeal.buyer.name == null) {
                array.push("");
            } else {
                array.push(nextDeal.buyer.name);
            }

            array.push(parseInt(weiToEther(nextDeal.sellAmount)));
            array.push(parseFloat(weiToEther(nextDeal.buyAmount)));
            rows.push(array);
        }

        let tableName = 'Tabla';

        await addTable(
            sheet,
            tableName,
            'B3',
            [
                {name: 'Fecha (pacto)', filterButton: true},
                {name: 'Hora (oferta)'},
                {name: 'Hora (pacto)'},
                {name: 'Oferta', filterButton: true},
                {name: 'Contrapartida', filterButton: true},
                {name: 'Vendedor (usuario)', filterButton: true},
                {name: 'Comprador (usuario)', filterButton: true},
                {name: 'Monto pactado ', totalsRowFunction: 'sum'},
                {name: 'Monto contrapartida', totalsRowFunction: 'sum'}
            ],
            rows
        );

        try {
            await workbook.xlsx.writeFile('PiMarketsPackableDealsReport.xlsx');
        } catch (error) {
            let buffer = await workbook.xlsx.writeBuffer();
            
            try {
                await FileSaver.saveAs(new Blob([buffer]), 'PiMarketsPackableDealsReport.xlsx');
            } catch (err) {
                console.error(err);
            }
        }
    }

    async getUserDealsReport(
        wallet: string,
        monthIndex: number,
        year: number
    ) {
        let toYear = year;
        let toMonthIndex = monthIndex + 1;

        if (monthIndex == 12) {
            toYear = year + 1;
            toMonthIndex = 1;
        }

        let timeLow = getUtcTimeFromDate(year, monthIndex, 1);
        let timeHigh = getUtcTimeFromDate(toYear, toMonthIndex, 1);

        await this.getUserDealsReportByTime(wallet, timeLow, timeHigh);
    }

    async getUserDealsReportByTime(
        wallet: string,
        timeLow: number,
        timeHigh: number,
        dex: "dex" | "dex-bicentenario" = "dex"
    ) {
        //GENERAL
        const workbook = new ExcelJS.Workbook();

        let generalSheet = workbook.addWorksheet('Resumen');
        let dealSheet = workbook.addWorksheet('P2P');
        let dexSheet = workbook.addWorksheet('DEX');
        let txSheet = workbook.addWorksheet('Transferencias');

        let queryTemplates = new QueryTemplates(this.url);
        let nickname = await queryTemplates.getNameByWallet(wallet);
        let deals = await getUserAllDeals(nickname, timeLow, timeHigh, this.url);
        let dealsPack = await getUserPackableAllDeals(nickname, timeLow, timeHigh, this.url);
        let dealsPrimary = await getUserAllDealsPrimary(nickname, timeLow, timeHigh, this.url);
        let dealsPrimaryPack = await getUserPackableAllDealsPrimary(nickname, timeLow, timeHigh, this.url);
        let txs = await getAllTransactionsByName(timeLow, timeHigh, nickname, this.url);

        //DEALS
        let totalUsd = 0;
        let totalDeals = 0;
        let dealRows = [];
        let nextDeal: any;

        while ((deals.length > 0) || (dealsPrimary.length > 0) || (dealsPack.length > 0) || (dealsPrimaryPack.length > 0)) {
            let _array: number[] = [];

            let nextDealTimestamp = timeHigh;
            if (deals.length > 0) {
                nextDealTimestamp = deals[deals.length - 1].timestamp;
            }

            let nextDealPrimaryTimestamp = timeHigh;
            if (dealsPrimary.length > 0) {
                nextDealPrimaryTimestamp = dealsPrimary[dealsPrimary.length - 1].timestamp;
            }

            let nextDealPackTimestamp = timeHigh;
            if (dealsPack.length > 0) {
                nextDealPackTimestamp = dealsPack[dealsPack.length - 1].timestamp;
            }

            let nextDealPrimaryPackTimestamp = timeHigh;
            if (dealsPrimaryPack.length > 0) {
                nextDealPrimaryPackTimestamp = dealsPrimaryPack[dealsPrimaryPack.length - 1].timestamp;
            }

            _array.push(nextDealTimestamp)
            _array.push(nextDealPrimaryTimestamp)
            _array.push(nextDealPackTimestamp)
            _array.push(nextDealPrimaryPackTimestamp)

            let index = 0;
            let min = _array[0];
            for (let i = 1; i < _array.length; i++) {
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

            let array = [];

            array.push(new Date(nextDeal.timestamp * 1000));
            array.push(timeConverter(nextDeal.offer.timestamp));
            array.push(timeConverter(nextDeal.timestamp));
            array.push(nextDeal.offer.sellToken.tokenSymbol);
            array.push(nextDeal.offer.buyToken.tokenSymbol);

            if (nextDeal.seller.name == null) {
                array.push("");
            } else {
                array.push(nextDeal.seller.name);
            }

            array.push(nextDeal.seller.id)

            if (nextDeal.buyer.name == null) {
                array.push("");
            } else {
                array.push(nextDeal.buyer.name);
            }

            array.push(nextDeal.buyer.id)

            array.push(parseFloat(weiToEther(nextDeal.sellAmount)));
            array.push(parseFloat(weiToEther(nextDeal.buyAmount)));
            
            let usdAmount = 0;

            if (
                (nextDeal.offer.buyToken.id == Constants.USD.address) ||
                (nextDeal.offer.buyToken.id == Constants.USC.address) ||
                (nextDeal.offer.buyToken.id == Constants.PEL.address)
            ) {
                usdAmount = parseFloat(weiToEther(nextDeal.buyAmount));
            } else {
                usdAmount = await convertToUsd(
                    parseFloat(weiToEther(nextDeal.buyAmount)), 
                    nextDeal.offer.buyToken.id,
                    nextDeal.timestamp
                );
            }

            array.push(usdAmount);

            totalUsd = +totalUsd + +usdAmount;
            totalDeals++;
            dealRows.push(array);
        }

        if (dealRows.length > 0) {
            dealSheet.getCell('B2').value = 'PACTOS';
            dealSheet.getCell('B2').font = {bold: true};
            let tableName = 'Month_Deals';
            
            addTable(
                dealSheet,
                tableName,
                'B4',
                [
                    {name: 'Fecha (pacto)', filterButton: true},
                    {name: 'Hora (oferta)'},
                    {name: 'Hora (pacto)'},
                    {name: 'Oferta', filterButton: true},
                    {name: 'Contrapartida', filterButton: true},
                    {name: 'Vendedor (usuario)', filterButton: true},
                    {name: 'Vendedor (wallet)', filterButton: true},
                    {name: 'Comprador (usuario)', filterButton: true},
                    {name: 'Comprador (wallet)', filterButton: true},
                    {name: 'Monto pactado'},
                    {name: 'Monto contrapartida'},
                    {name: 'Monto contrapartida (USD)', totalsRowFunction: 'sum'}
                ],
                dealRows
            );
        } else {
            dealSheet.getCell('B2').value = 'NO HAY PACTOS';
            dealSheet.getCell('B2').font = {bold: true};
        }

        let dexDeals = await getDexDealsByWallet(timeLow, timeHigh, wallet, dex, this.url);

        let nextDexDeal: any;
        let dealsRow = [];

        for (let i = 0; i < dexDeals.length; i++) {
            nextDexDeal = dexDeals[i];

            let dealRow = [];
            let baseToken: string;
            let baseAmount: string;

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
                } else if (nextDexDeal.orderA.owner.id) {
                    dealRow.push("VENTA");
                }
                
                //PRICE
                dealRow.push(parseFloat(weiToEther(nextDexDeal.price)));

                //AMOUNT (in nominatorToken)
                dealRow.push(parseFloat(weiToEther(nextDexDeal.amountA)));

                //AMOUNT (in baseToken aka PEL)
                dealRow.push(parseFloat(weiToEther(nextDexDeal.amountB)));

            } else {
                //amountA is in baseToken (PEL)
                //amountB is in nominatorToken
                //orderA-BUY & orderB-SELL
                baseToken = nextDexDeal.tokenB.id;
                baseAmount = nextDexDeal.amountA;

                dealRow.push(nextDexDeal.tokenA.tokenSymbol + "_" + nextDexDeal.tokenB.tokenSymbol);

                if (nextDexDeal.orderA.owner.id == wallet) {
                    dealRow.push("COMPRA");
                } else if (nextDexDeal.orderB.owner.id) {
                    dealRow.push("VENTA");
                }

                //PRICE
                dealRow.push(parseFloat(weiToEther(nextDexDeal.price)));

                //AMOUNT (in nominatorToken)
                dealRow.push(parseFloat(weiToEther(nextDexDeal.amountB)));

                //AMOUNT (in baseToken aka PEL)
                dealRow.push(parseFloat(weiToEther(nextDexDeal.amountA)));
            }

            let usdAmount = 0;

            if (
                (baseToken == Constants.USD.address) ||
                (baseToken == Constants.USC.address) ||
                (baseToken == Constants.PEL.address)
            ) {
                usdAmount = parseFloat(weiToEther(baseAmount));
            } else {
                usdAmount = await convertToUsd(
                    parseFloat(weiToEther(baseAmount)), 
                    baseToken,
                    nextDexDeal.timestamp
                );
            }

            dealRow.push(usdAmount);

            dealsRow.push(dealRow);

            totalUsd = +totalUsd + +usdAmount;
            totalDeals++;
        }

        //GENERAL
        let array = [];
        let rows = [];

        generalSheet.getCell('B2').value = 'RESUMEN: ' + (new Date(timeLow * 1000)).toUTCString() + ' <--> ' + (new Date(timeHigh * 1000)).toUTCString();
        generalSheet.getCell('B2').font = {bold: true};

        array.push(nickname);
        array.push(totalUsd);
        array.push(totalDeals);
        rows.push(array);

        let tableNameGeneral = 'General';
        
        addTable(
            generalSheet,
            tableNameGeneral,
            'B4',
            [
                {name: 'Usuario'},
                {name: 'Total pactado (USD)'},
                {name: 'Número total de pactos'}
            ],
            rows
        );

        let bc = new Blockchain(this.url);
        let firstBlockNumber = 0;
        let lastBlockNumber = 0;

        if (txs.length == 0) {
            let prevTx = await getUserLastTxBeforeTime(nickname, timeLow, this.url);

            if (prevTx != null) {
                let [txHash, logIndex] = String(prevTx).split('-');
                let tx = await bc.getTransaction(txHash);
                firstBlockNumber = tx.blockNumber;
                firstBlockNumber = firstBlockNumber + 1;
                lastBlockNumber = firstBlockNumber;
            } else {
                firstBlockNumber = await bc.getBlockNumber();
                firstBlockNumber = firstBlockNumber - 5;
                lastBlockNumber = firstBlockNumber;
            }
            
        } else {
            let [txHashFirst, logIndexFirst] = String(txs[txs.length - 1].id).split('-');
            let txFirst = await bc.getTransaction(txHashFirst);
            firstBlockNumber = txFirst.blockNumber;
            firstBlockNumber = firstBlockNumber + 1;

            let [txHashLast, logIndexLast] = String(txs[0].id).split('-');
            let txLast = await bc.getTransaction(txHashLast);
            lastBlockNumber = txLast.blockNumber;
            lastBlockNumber = lastBlockNumber + 1;
        }

        let balancesFirst = await getUserBalances(nickname, firstBlockNumber, this.url);
        let balancesLast = await getUserBalances(nickname, lastBlockNumber, this.url);

        setBalancesTable(generalSheet, balancesFirst, 'Balances_Init', 'B9');
        setBalancesTable(generalSheet, balancesLast, 'Balances_Last', 'E9');

        generalSheet.getCell('B8').value = 'Fecha de inicio';
        generalSheet.getCell('B8').font = {bold: true};
        generalSheet.getCell('E8').value = 'Final final';
        generalSheet.getCell('E8').font = {bold: true};

        //TRANSFERS
        if (txs.length > 0) {
            let txRows = [];

            for (let j = 0; j < txs.length; j++) {
                let array = [];
                
                array.push(new Date(txs[j].timestamp * 1000));
                array.push(txs[j].currency.tokenSymbol);
                array.push(txs[j].from.id);

                if (txs[j].from.name == null) {
                    array.push("");
                } else {
                    array.push(txs[j].from.name.id);
                }

                array.push(txs[j].to.id);

                if (txs[j].to.name == null) {
                    array.push("");
                } else {
                    array.push(txs[j].to.name.id);
                }

                array.push(parseFloat(weiToEther(txs[j].amount)));
                let usdAmount = await convertToUsd(
                    parseFloat(weiToEther(txs[j].amount)), 
                    txs[j].currency.id,
                    txs[j].timestamp
                );
                array.push(usdAmount);
                txRows.push(array);
            }

            if (txRows.length > 0) {
                txSheet.getCell('B2').value = 'TRANSFERENCIAS';
                txSheet.getCell('B2').font = {bold: true};
                let tableName = 'Month_TXs';

                addTable(
                    txSheet,
                    tableName,
                    'B4',
                    [
                        {name: 'Fecha', filterButton: true},
                        {name: 'Divisa'},
                        {name: 'Origen (wallet)'},
                        {name: 'Origen (usuario)', filterButton: true},
                        {name: 'Destino (wallet)'},
                        {name: 'Destino (usuario)', filterButton: true},
                        {name: 'Monto'},
                        {name: 'Monto (USD)'}
                    ],
                    txRows
                );
            }
        }  else {
            txSheet.getCell('B2').value = 'NO HAY TRANSFERENCIAS';
            txSheet.getCell('B2').font = {bold: true};
        }

        //DEX TABLE
        let tableName = 'DexDeals';

        if (dealsRow.length == 0) {
            dealsRow = [[new Date(), "", "", 0, 0, 0]];
        }

        addTable(
            dexSheet,
            tableName,
            'B2',
            [
                {name: 'Fecha', filterButton: true},
                {name: 'Par', filterButton: true},
                {name: 'Compra/Venta', filterButton: true},
                {name: 'Precio', totalsRowFunction: 'average'},
                {name: 'Cantidad', totalsRowFunction: 'sum'},
                {name: 'Cantidad (contrapartida)', totalsRowFunction: 'sum'},
                {name: 'Cantidad (USD)', totalsRowFunction: 'sum'}
            ],
            dealsRow
        );

        try {
            await workbook.xlsx.writeFile('PiMarketsUserReport.xlsx');
        } catch (error) {
            let buffer = await workbook.xlsx.writeBuffer();
            
            try {
                await FileSaver.saveAs(new Blob([buffer]), 'PiMarketsUserReport.xlsx');
            } catch (err) {
                console.error(err);
            }
        }
    }

    async getUsersReport(
        monthIndex: number,
        year: number,
        authToken: string
    ) {
        const ratesObj = {};
        const workbook = new ExcelJS.Workbook();

        let sheet = workbook.addWorksheet('SmartID_Report');

        let toYear = year;
        let toMonthIndex = monthIndex + 1;

        if (monthIndex == 12) {
            toYear = year + 1;
            toMonthIndex = 1;
        }

        let timeLow = getUtcTimeFromDate(year, monthIndex, 1);
        let timeHigh = getUtcTimeFromDate(toYear, toMonthIndex, 1);

        let queryTemplates = new QueryTemplates(this.url);
        let response = await queryTemplates.getSmartIDs(0);
        let identities = response;

        while(response.length >= 1000) {
            response = await queryTemplates.getSmartIDs(identities.length);
            identities = identities.concat(response);
        }

        let inputsObj = {}
        let inputsAmountObj = {}
        let outputsObj = {}
        let outputsAmountObj = {}
        let totalObj = {}
        let maxObj = {}
        let kycAmountsObj = {}
        let flagsObj = {}
        let identitiesArray = [];
        for (let k = 0; k < identities.length; k++) {
            let identity = String(identities[k].identity).toLowerCase();
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

        let txs = await getAllTransactions(timeLow, timeHigh, this.url);

        for (let m = 0; m < txs.length; m++) {
            let tx = txs[m];

            let txAmount = await convertToUsdFromObj(
                parseFloat(weiToEther(tx.amount)),
                tx.currency.id,
                parseInt(tx.currency.tokenKind),
                tx.timestamp,
                ratesObj
            );

            if (tx.from.identity != null) {
                let from = String(tx.from.identity.id).toLowerCase();
                if (identitiesArray.includes(from)) {
                    outputsObj[from]++;
                    outputsAmountObj[from] = outputsAmountObj[from] + txAmount;

                    if (txAmount > Math.abs(maxObj[from])) {
                        maxObj[from] = txAmount * (-1);
                    }
                }
            }

            if (tx.to.identity != null) {
                let to = String(tx.to.identity.id).toLowerCase();
                if (identitiesArray.includes(to)) {
                    inputsObj[to]++;
                    inputsAmountObj[to] = inputsAmountObj[to] + txAmount;

                    if (txAmount > Math.abs(maxObj[to])) {
                        maxObj[to] = txAmount;
                    }
                }
            }
        }

        let names = [];
        let namesQuery = await queryTemplates.getNamesByIdentityArray(identitiesArray, names.length);
        names = namesQuery;

        while(namesQuery.length > 1000) {
            namesQuery = await queryTemplates.getNamesByIdentityArray(identitiesArray, names.length);
            names = names.concat(namesQuery);
        }

        let walletsArray = [];
        for (let p = 0; p < names.length; p++) {
            walletsArray.push(String(names[p].wallet.id).toLowerCase());
        }

        let usersKyc = await getUsersDataProtected(walletsArray, authToken);

        let tableArray = [];

        for(let n = 0; n < names.length; n++) {
            let array = [];
            let id = names[n];
            let pibid = String(id.id).toLowerCase();

            let total = inputsAmountObj[pibid] - outputsAmountObj[pibid];
            let userKyc = usersKyc.filter(obj => {
                return obj.nickname == id.wallet.name.id;
            })
            
            let kycAmount;
            let topLimit = 0;
            let monthly_income = "ERROR";

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
                } else {
                    topLimit = 0;
                    monthly_income = "ERROR";
                }
            } else {
                topLimit = 0;
                monthly_income = "ERROR";
            }

            let flag = 0;

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
        }

        addTable(
            sheet,
            'SmartIDReportTable',
            'B2',
            [
                {name: 'Nombre', filterButton: true},
                {name: 'N Entradas'},
                {name: 'Entradas (USD)'},
                {name: 'N Salidas'},
                {name: 'Salidas (USD)'},
                {name: 'Total (USD)'},
                {name: 'Max (USD)', filterButton: true},
                {name: 'Declarado (USD)', filterButton: true},
                {name: 'Alerta', filterButton: true}
            ],
            tableArray
        );

        try {
            await workbook.xlsx.writeFile('PiMarketsSmartIDReport.xlsx');
        } catch (error) {
            let buffer = await workbook.xlsx.writeBuffer();
            
            try {
                await FileSaver.saveAs(new Blob([buffer]), 'PiMarketsSmartIDReport.xlsx');
            } catch (err) {
                console.error(err);
            }
        }
    }

    async getTransactionsData(
        timeLow: number,
        timeHigh: number,
        token: any
    ) {
        return await getTransactions(timeLow, timeHigh, token.address, this.url);
    }

    async getDealsData(
        timeLow: number,
        timeHigh: number,
        token: any,
        market: "primary" | "secondary" = "secondary"
    ) {
        let offers: any[] = [];
        let requests: any[] = [];

        if (token.category == 1) {
            if (market == "secondary") {
                offers = await getOffers(timeLow, timeHigh, token.address, this.url);
                requests = await getRequests(timeLow, timeHigh, token.address, this.url);
            } else if (market == "primary") {
                offers = await getOffersPrimary(timeLow, timeHigh, token.address, this.url);
                requests = await getRequestsPrimary(timeLow, timeHigh, token.address, this.url);
            }
        } else if (token.category == 2) {
            if (market == "secondary") {
                offers = await getCollectableOffers(timeLow, timeHigh, token.address, this.url);
            } else if (market == "primary") {
                offers = await getCollectableOffersPrimary(timeLow, timeHigh, token.address, this.url);
            }
        } else if (token.category == 3) {
            if (market == "secondary") {
                offers = await getPackableOffers(timeLow, timeHigh, token.address, this.url);
                requests = await getPackableRequests(timeLow, timeHigh, token.address, this.url);
            } else if (market == "primary") {
                offers = await getPackableOffersPrimary(timeLow, timeHigh, token.address, this.url);
                requests = await getPackableRequestsPrimary(timeLow, timeHigh, token.address, this.url);
            }
        }

        offers = cleanEmptyDeals(offers);
        requests = cleanEmptyDeals(requests);

        return new DealsReportData(token.address, token.symbol, offers, requests);
    }

    async getHoldersData(
        token: any,
        expiry?: any
    ) {
        const first = 1000;
        const orderBy = "balance";
        const orderDirection = "desc";
        let queryTemplates = new QueryTemplates(this.url);
        let skip = 0;
        let holders: any[] = [];
        let offers: any[] = [];

        if (token.category == 1) {
            holders = await queryTemplates.getTokenHolders(
                orderBy,
                orderDirection,
                first,
                skip,
                token.address
            );
    
            let loopresponse = holders;
    
            while(loopresponse.length >= 1000) {
                skip = holders.length;
                holders = await queryTemplates.getTokenHolders(
                    orderBy,
                    orderDirection,
                    first,
                    skip,
                    token.address
                );
                holders = holders.concat(loopresponse);
            }

            let skipOffers = 0;
    
            offers = await queryTemplates.getOffers(
                'sellToken: "' + token.address + '", isOpen: true',
                'sellAmount',
                'desc',
                1000,
                skipOffers
            );
    
            let loopOffers = offers;
    
            while(loopOffers.length >= 1000) {
                skipOffers = offers.length;
                offers = await queryTemplates.getOffers(
                    'sellToken: "' + token.address + '", isOpen: true',
                    'sellAmount',
                    'desc',
                    1000,
                    skipOffers
                );
                offers = offers.concat(loopOffers);
            }
        } else if (token.category == 2) {
            holders = await queryTemplates.getNFTHolders(
                orderBy,
                orderDirection,
                first,
                skip,
                token.address
            );
    
            let loopresponse = holders;
    
            while(loopresponse.length >= 1000) {
                skip = holders.length;
                holders = await queryTemplates.getNFTHolders(
                    orderBy,
                    orderDirection,
                    first,
                    skip,
                    token.address
                );
                holders = holders.concat(loopresponse);
            }

            let skipOffers = 0;
    
            offers = await queryTemplates.getNFTOffers(
                'sellToken: "' + token.address + '", isOpen: true',
                'sellAmount',
                'desc',
                1000,
                skipOffers
            );
    
            let loopOffers = offers;
    
            while(loopOffers.length >= 1000) {
                skipOffers = offers.length;
                offers = await queryTemplates.getNFTOffers(
                    'sellToken: "' + token.address + '", isOpen: true',
                    'sellAmount',
                    'desc',
                    1000,
                    skipOffers
                );
                offers = offers.concat(loopOffers);
            }
        } else if (token.category == 3) {
            holders = await queryTemplates.getPackableHolders(
                token.address,
                expiry[1],
                orderBy,
                orderDirection,
                first,
                skip
            );
    
            let loopresponse = holders;
    
            while(loopresponse.length >= 1000) {
                skip = holders.length;
                holders = await queryTemplates.getPackableHolders(
                    token.address,
                    expiry[1],
                    orderBy,
                    orderDirection,
                    first,
                    skip
                );
                holders = holders.concat(loopresponse);
            }

            let skipOffers = 0;
    
            offers = await queryTemplates.getPackableOffers(
                'sellToken: "' + token.address + '", sellId: "' + expiry[1] + '", isOpen: true',
                'sellAmount',
                'desc',
                1000,
                skipOffers
            );
    
            let loopOffers = offers;
    
            while(loopOffers.length >= 1000) {
                skipOffers = offers.length;
                offers = await queryTemplates.getPackableOffers(
                    'sellToken: "' + token.address + '", sellId: "' + expiry[1] + '", isOpen: true',
                    'sellAmount',
                    'desc',
                    1000,
                    skipOffers
                );
                offers = offers.concat(loopOffers);
            }
        }

        return new HoldersReportData(token.address, token.symbol, holders, offers, expiry);
    }

    async getDBUser(
        wallet: string,
        bearerToken: string,
        includeBank: boolean
    ) {
        let array = [];
        array.push(wallet);
        
        try {
            return await getUsersDataProtected(
                array,
                bearerToken,
                includeBank
            );
        } catch (e) {
            console.error(e);
        }
    }

    async getDexReport(
        timeLow: number,
        timeHigh: number,
        instruments: any[],
        dex: "dex" | "dex-bicentenario",
        hideNames: boolean = true
    ) {
        const workbook = new ExcelJS.Workbook();
        let promises: any = [];

        for (let i = 0; i < instruments.length; i++) {
            let sheet = workbook.addWorksheet(instruments[i].symbol);

            promises.push(setDexSheet(
                sheet,
                timeLow,
                timeHigh,
                instruments[i],
                dex,
                this.url,
                hideNames
            ));
        }

        await Promise.all(promises);

        try {
            await workbook.xlsx.writeFile('PiMarketsDEXReport.xlsx');
        } catch (error) {
            let buffer = await workbook.xlsx.writeBuffer();
            
            try {
                await FileSaver.saveAs(new Blob([buffer]), 'PiMarketsDEXReport.xlsx');
            } catch (err) {
                console.error(err);
            }
        }
    }
}

async function getUserMonthStatsByIdentityByTime(
    _identity: string,
    _timeLow: number,
    _timeHigh: number,
    _url: string = 'mainnet'
) {
    let _stats = await getUserTxStatsByNameByTime(_identity, _timeLow, _timeHigh, _url);
    let _kycMax = 0;
    let _flag = 0;

    _stats.push(_kycMax);
    _stats.push(_flag);

    console.log("-------------" + _stats[0])

    return _stats;
}

async function getUserTxStatsByNameByTime(
    _identity: string,
    _timeLow: number,
    _timeHigh: number,
    _url: string = 'mainnet'
) {
    let txsAndName = await try_getAllTransactionsByIdentity(
        _timeLow,
        _timeHigh,
        _identity,
        _url
    );

    let txs = txsAndName[0];
    let _nickname = txsAndName[1];

    let _inputs = 0;
    let _outputs = 0;
    let _inputsAmount = 0;
    let _outputsAmount = 0;
    let _max = 0;
    let _maxSide = true;

    for (let i = 0; i < txs.length; i++) {
        let tx = txs[i];
        let txAmount = await convertToUsd(
            parseFloat(weiToEther(tx.amount)),
            tx.currency.id,
            tx.timestamp
        );

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
    }

    if (!_maxSide) _max *= -1;

    return [txsAndName[1], _inputs, _inputsAmount, _outputs, _outputsAmount, (_inputsAmount - _outputsAmount), _max];
}

async function setTransactionSheet(
    sheet: any,
    timeLow: number,
    timeHigh: number,
    monthIndex: number,
    year: number,
    toMonthIndex: number,
    toYear: number,
    url: string,
    token: any,
    hideNames: boolean = true,
    name?: string
) {
    //define vars
    let day = 1;
    let week = 1;
    let month = 1;
    let dayCounter = 0;
    let weekCounter = 0;
    let weekRates = 0;
    let monthCounter = 0;
    let monthRates = 0;
    let weekZeros = 0;
    let monthZeros = 0;
    let _timeLow = timeLow;
    let _timeHigh = _timeLow + ONE_UTC_DAY;
    let dayRows = [];
    let weekRows = [];
    let monthRows = [];
    let txRows = [];

    //rates: array[31] with USD price (padded with 0s)
    let rates = await getDayRate(
        year, 
        monthIndex, 
        toYear, 
        toMonthIndex, 
        token.address,
        token.category
    );

    let transactions = await try_getTransactions(timeLow, timeHigh, token.address, url, 0, name);

    let nextTx: any;
    let nextTimestamp: number;

    if (transactions.length > 0) {
        nextTx = transactions.pop();
        nextTimestamp = nextTx.timestamp;
    } else {
        nextTimestamp = 0;
    }

    while(_timeHigh <= timeHigh) {

        while ((_timeLow < nextTimestamp) && (nextTimestamp < _timeHigh)) {
            //compute tx
            let txDayRow = [];
            let amount = parseFloat(weiToEther(nextTx.amount));
            dayCounter = dayCounter + amount;
            weekCounter = weekCounter + amount;
            monthCounter = monthCounter + amount;
        
            //TXs Table
            txDayRow.push(new Date(nextTx.timestamp * 1000));
            txDayRow.push(nextTx.currency.tokenSymbol);
            
            if (!hideNames) {
                if (nextTx.from.name == null) {
                    txDayRow.push("");
                } else {
                    txDayRow.push(nextTx.from.name.id);
                }
            } else {
                txDayRow.push(nextTx.from.id);
            }

            if (!hideNames) {
                if (nextTx.to.name == null) {
                    txDayRow.push("");
                } else {
                    txDayRow.push(nextTx.to.name.id);
                }
            } else {
                txDayRow.push(nextTx.to.id);
            }

            txDayRow.push(parseFloat(weiToEther(nextTx.amount)));
            txRows.push(txDayRow);

            //pop new tx
            if (transactions.length > 0) {
                nextTx = transactions.pop();
                nextTimestamp = nextTx.timestamp;
            } else {
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
            if ((7 - weekZeros) == 0){
                weekRates = 0;
            } else {
                weekRates = weekRates / (7 - weekZeros);
            }

            //update week arrays
            let weekRow = []; 
            
            weekRow.push(week);
            weekRow.push(weekCounter);
            weekRow.push(weekCounter * weekRates);
            weekRow.push(weekRates);
            weekRows.push(weekRow);

            //reset and update counters
            week++;
            weekCounter = 0;
            weekRates = 0;
            weekZeros = 0;
        }

        //compute day
        let dayRow = [];

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

    //5th week...days (29-31)
    //5th WEEK (days 29-31)
    let weekRow = [];
    
    //calc 5th week rate
    if ((day - 29 - weekZeros) == 0){
        weekRates = 0;
    } else {
        weekRates = weekRates / (day - 29 - weekZeros);
    }

    //update week arrays
    weekRow.push(week);
    weekRow.push(weekCounter);
    weekRow.push(weekCounter * weekRates);
    weekRow.push(weekRates);
    weekRows.push(weekRow);

    //compute month
    let monthRow = [];

    //calc month rate
    if ((day - 1 - monthZeros) == 0){
        monthRates = 0;
    } else {
        monthRates = monthRates / (day - 1 - monthZeros);
    }

    //update month arrays
    monthRow.push(month);
    monthRow.push(monthCounter);
    monthRow.push(monthCounter * monthRates);
    monthRow.push(monthRates);
    monthRows.push(monthRow);

    //add tables
    //ADD SHEET TABLES
    let tableDay = 'TablaDay' + token.symbol;
    let tableWeek = 'TablaWeek' + token.symbol;
    let tableMonth = 'TablaMonth' + token.symbol;

    addTable(
        sheet,
        tableDay,
        'B2',
        [
            {name: 'Día', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'},
            {name: 'Monto (USD)', totalsRowFunction: 'sum'},
            {name: 'Tipo de cambio'}
        ],
        dayRows
    );

    addTable(
        sheet,
        tableWeek,
        'G2',
        [
            {name: 'Semana', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'},
            {name: 'Monto (USD)', totalsRowFunction: 'sum'},
            {name: 'Tipo de cambio'}
        ],
        weekRows
    );

    addTable(
        sheet,
        tableMonth,
        'L2',
        [
            {name: 'Mes', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'},
            {name: 'Monto (USD)', totalsRowFunction: 'sum'},
            {name: 'Tipo de cambio'}
        ],
        monthRows
    );

    //TXs TABLE
    let tableName = 'Tabla' + token.symbol;

    if (txRows.length == 0) {
        txRows = getEmptyTransaction();
    }

    addTable(
        sheet,
        tableName,
        'B36',
        [
            {name: 'Fecha', filterButton: true},
            {name: 'Divisa'},
            {name: 'Origen (wallet)', filterButton: true},
            {name: 'Destino (wallet)', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'}
        ],
        txRows
    );

    //CELL LABELS
    sheet.getCell('B35').value = 'TRANSFERENCIAS';
    sheet.getCell('B35').font = {bold: true};
    
    sheet.getCell('B1').value = 'TOTAL (diario)';
    sheet.getCell('B1').font = {bold: true};
    
    sheet.getCell('G1').value = 'TOTAL (semanal)';
    sheet.getCell('G1').font = {bold: true};

    sheet.getCell('L1').value = 'TOTAL (mensual)';
    sheet.getCell('L1').font = {bold: true};
}

async function setTransactionSheetByArray(
    sheet: any,
    timeLow: number,
    timeHigh: number,
    addressesArray: string[],
    url: string,
    token: any,
    hideNames: boolean = true
) {
    let txRows = [];

    let fromTxs = await try_getTransactionsFromArray(timeLow, timeHigh, token.address, addressesArray, url, 0);
    let toTxs = await try_getTransactionsToArray(timeLow, timeHigh, token.address, addressesArray, url, 0);

    while ((fromTxs.length > 0) || (toTxs.length > 0)) {
        let nextTx: any;
        if (fromTxs.length == 0) {
            nextTx = toTxs.pop();
        } else if (toTxs.length == 0) {
            nextTx = fromTxs.pop();
        } else {
            let fromTimestamp = fromTxs[fromTxs.length - 1].timestamp;
            let toTimestamp = toTxs[toTxs.length - 1].timestamp;

            if (fromTimestamp < toTimestamp) {
                nextTx = fromTxs.pop();
            } else {
                nextTx = toTxs.pop();
            }
        }

        let txDayRow = [];

        //TXs Table
        txDayRow.push(new Date(nextTx.timestamp * 1000));
        txDayRow.push(nextTx.currency.tokenSymbol);
        
        if (!hideNames) {
            if (nextTx.from.name == null) {
                txDayRow.push("");
            } else {
                txDayRow.push(nextTx.from.name.id);
            }
        } else {
            txDayRow.push(nextTx.from.id);
        }

        if (!hideNames) {
            if (nextTx.to.name == null) {
                txDayRow.push("");
            } else {
                txDayRow.push(nextTx.to.name.id);
            }
        } else {
            txDayRow.push(nextTx.to.id);
        }

        txDayRow.push(parseFloat(weiToEther(nextTx.amount)));
        txRows.push(txDayRow);
    }

    //TXs TABLE
    let tableName = 'Tabla' + token.symbol;

    if (txRows.length == 0) {
        txRows = getEmptyTransaction();
    }

    addTable(
        sheet,
        tableName,
        'B2',
        [
            {name: 'Fecha', filterButton: true},
            {name: 'Divisa'},
            {name: 'Origen (wallet)', filterButton: true},
            {name: 'Destino (wallet)', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'}
        ],
        txRows
    );
}

async function setTokenDealsSheet(
    sheet: any,
    timeLow: number,
    timeHigh: number,
    monthIndex: number,
    year: number,
    toMonthIndex: number,
    toYear: number,
    url: string,
    token: any,
    hideNames: boolean = true,
) {
    //define vars
    let day = 1;
    let week = 1;
    let month = 1;
    let dayCounter = 0;
    let weekCounter = 0;
    let monthCounter = 0;
    let weekRates = 0;
    let monthRates = 0;
    let weekZeros = 0;
    let monthZeros = 0;
    let _timeLow = timeLow;
    let _timeHigh = _timeLow + ONE_UTC_DAY;
    let dayRows = [];
    let weekRows = [];
    let monthRows = [];
    let offersRows = [];
    let requestsRows = [];

    let dayOffers = await try_getOffers(timeLow, timeHigh, token.address, url);
    let dayRequests = await try_getRequests(timeLow, timeHigh, token.address, url);

    //rates: array[31] with USD price (padded with 0s)
    let rates = await getDayRate(
        year, 
        monthIndex, 
        toYear, 
        toMonthIndex, 
        token.address,
        token.category
    );

    let nextOffer: any;
    let nextTimestamp: number;
    let nextIsOffer: boolean;

    if ((dayOffers.length == 0) && (dayRequests.length > 0)) {
        nextOffer = dayRequests.pop();
        nextTimestamp = nextOffer.timestamp;
        nextIsOffer = false;
    } else if ((dayRequests.length == 0) && (dayOffers.length > 0)) {
        nextOffer = dayOffers.pop();
        nextTimestamp = nextOffer.timestamp;
        nextIsOffer = true;
    } else if ((dayOffers.length > 0) || (dayRequests.length > 0)) {
        let nextOfferTimestamp = dayOffers[dayOffers.length - 1].timestamp;
        let nextRequestTimestamp = dayRequests[dayRequests.length - 1].timestamp;

        if (nextOfferTimestamp < nextRequestTimestamp) {
            nextOffer = dayOffers.pop();
            nextTimestamp = nextOffer.timestamp;
            nextIsOffer = true;
        } else {
            nextOffer = dayRequests.pop();
            nextTimestamp = nextOffer.timestamp;
            nextIsOffer = false;
        }
    } else {
        nextTimestamp = 0;
    }

    while (_timeHigh <= timeHigh) {

        while ((_timeLow < nextTimestamp) && (nextTimestamp < _timeHigh)) {
            //compute offer
            if (nextOffer.deals.length > 0) {
                if (nextIsOffer) {
                    //COMPUTE OFFER
                    let deals = nextOffer.deals;
                    for (let q = 0; q < deals.length; q++) {
                        //1 DEAL per iteration
                        let amount = parseFloat(weiToEther(deals[q].sellAmount));
                        dayCounter = dayCounter + amount;
                        weekCounter = weekCounter + amount;
                        monthCounter = monthCounter + amount;

                        //DEALS TABLE
                        let array = [];

                        array.push(new Date(deals[q].timestamp * 1000));
                        array.push(timeConverter(deals[q].offer.timestamp));
                        array.push(timeConverter(deals[q].timestamp));
                        array.push(deals[q].offer.buyToken.tokenSymbol);

                        if (!hideNames) {
                            if (deals[q].seller.name == null) {
                                array.push("");
                            } else {
                                array.push(deals[q].seller.name);
                            }
    
                            if (deals[q].buyer.name == null) {
                                array.push("");
                            } else {
                                array.push(deals[q].buyer.name);
                            }
                        } else {
                            array.push(deals[q].seller.id);
                            array.push(deals[q].buyer.id);
                        }

                        array.push(parseFloat(weiToEther(deals[q].sellAmount)));
                        array.push(parseFloat(weiToEther(deals[q].buyAmount)));
                        offersRows.push(array);
                        //1 DEAL per iteration
                    }
                } else {
                    //COMPUTE REQUEST
                    let deals = nextOffer.deals;
                    for (let q = 0; q < deals.length; q++) {
                        let amount = parseFloat(weiToEther(deals[q].buyAmount));
                        dayCounter = dayCounter + amount;
                        weekCounter = weekCounter + amount;
                        monthCounter = monthCounter + amount;

                        let array = [];

                        array.push(new Date(deals[q].timestamp * 1000));
                        array.push(timeConverter(deals[q].offer.timestamp));
                        array.push(timeConverter(deals[q].timestamp));
                        array.push(deals[q].offer.sellToken.tokenSymbol);

                        if (!hideNames) {
                            if (deals[q].seller.name == null) {
                                array.push("");
                            } else {
                                array.push(deals[q].seller.name);
                            }
    
                            if (deals[q].buyer.name == null) {
                                array.push("");
                            } else {
                                array.push(deals[q].buyer.name);
                            }
                        } else {
                            array.push(deals[q].seller.id);
                            array.push(deals[q].buyer.id);
                        }

                        array.push(parseFloat(weiToEther(deals[q].buyAmount)));
                        array.push(parseFloat(weiToEther(deals[q].sellAmount)));
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
            } else if ((dayRequests.length == 0) && (dayOffers.length > 0)) {
                nextOffer = dayOffers.pop();
                nextTimestamp = nextOffer.timestamp;
                nextIsOffer = true;
            } else if ((dayOffers.length > 0) || (dayRequests.length > 0)) {
                let nextOfferTimestamp = dayOffers[dayOffers.length - 1].timestamp;
                let nextRequestTimestamp = dayRequests[dayRequests.length - 1].timestamp;
    
                if (nextOfferTimestamp < nextRequestTimestamp) {
                    nextOffer = dayOffers.pop();
                    nextTimestamp = nextOffer.timestamp;
                    nextIsOffer = true;
                } else {
                    nextOffer = dayRequests.pop();
                    nextTimestamp = nextOffer.timestamp;
                    nextIsOffer = false;
                }
            } else {
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
            if ((7 - weekZeros) == 0){
                weekRates = 0;
            } else {
                weekRates = weekRates / (7 - weekZeros);
            }

            let weekRow = [];

            weekRow.push(week);
            weekRow.push(weekCounter);
            weekRow.push(weekCounter * weekRates);
            weekRow.push(weekRates);
            weekRows.push(weekRow);

            weekCounter = 0;
            weekRates = 0
            weekZeros = 0;
            week++;
        }

        //compute day
        let dayRow = [];

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

    //5th week...days (29-31)
    let weekRow = [];

    //calc 5th week rates
    if ((day - 29 - weekZeros) == 0){
        weekRates = 0;
    } else {
        weekRates = weekRates / (day - 29 - weekZeros);
    }

    weekRow.push(week);
    weekRow.push(weekCounter);
    weekRow.push(weekCounter * weekRates);
    weekRow.push(weekRates);
    weekRows.push(weekRow);

    //MONTH
    let monthRow = [];

    if ((day - 1 - monthZeros) == 0){
        monthRates = 0;
    } else {
        monthRates = monthRates / (day - 1 - monthZeros);
    }

    monthRow.push(month);
    monthRow.push(monthCounter);
    monthRow.push(monthCounter * monthRates);
    monthRow.push(monthRates);
    monthRows.push(monthRow);

    //ADD TABLES
    let tableDay = 'TablaDay' + token.symbol;
    let tableWeek = 'TablaWeek' + token.symbol;
    let tableMonth = 'TablaMonth' + token.symbol;

    addTable(
        sheet,
        tableDay,
        'B3',
        [
            {name: 'Día', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'},
            {name: 'Monto (USD)', totalsRowFunction: 'sum'},
            {name: 'Tipo de cambio'}
        ],
        dayRows
    );

    addTable(
        sheet,
        tableWeek,
        'G3',
        [
            {name: 'Semana', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'},
            {name: 'Monto (USD)', totalsRowFunction: 'sum'},
            {name: 'Tipo de cambio'}
        ],
        weekRows
    );

    addTable(
        sheet,
        tableMonth,
        'L3',
        [
            {name: 'Mes', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'},
            {name: 'Monto (USD)', totalsRowFunction: 'sum'},
            {name: 'Tipo de cambio'}
        ],
        monthRows
    );

    sheet.getCell('B36').value = 'PACTOS (' + token.symbol + ' OFERTADO)';
    sheet.getCell('B36').font = {bold: true};
    let tableName = 'Tabla' + token.symbol;

    if (offersRows.length == 0) {
        offersRows = getEmtpyDeal();
    }

    addTable(
        sheet,
        tableName,
        'B37',
        [
            {name: 'Fecha (pacto)', filterButton: true},
            {name: 'Hora (oferta)'},
            {name: 'Hora (pacto)'},
            {name: 'Contrapartida', filterButton: true},
            {name: 'Vendedor', filterButton: true},
            {name: 'Comprador', filterButton: true},
            {name: 'Monto pactado (' + token.symbol + ')', totalsRowFunction: 'sum'},
            {name: 'Monto contrapartida', totalsRowFunction: 'sum'}
        ],
        offersRows
    );

    sheet.getCell('K36').value = 'PACTOS (' + token.symbol + ' DEMANDADO)';
    sheet.getCell('K36').font = {bold: true};
    let tableName2 = 'Tabla2' + token.symbol;

    if (requestsRows.length == 0) {
        requestsRows = getEmtpyDeal();
    }

    addTable(
        sheet,
        tableName2,
        'K37',
        [
            {name: 'Fecha (pacto)', filterButton: true},
            {name: 'Hora (oferta)'},
            {name: 'Hora (pacto)'},
            {name: 'Contrapartida', filterButton: true},
            {name: 'Vendedor', filterButton: true},
            {name: 'Comprador', filterButton: true},
            {name: 'Monto pactado (' + token.symbol + ')', totalsRowFunction: 'sum'},
            {name: 'Monto contrapartida', totalsRowFunction: 'sum'}
        ],
        requestsRows
    );

    sheet.getCell('C1').value = 'Mercado P2P (Secundario)';
    sheet.getCell('C1').font = {bold: true};

    sheet.getCell('B2').value = 'TOTAL (diario)';
    sheet.getCell('B2').font = {bold: true};
    
    sheet.getCell('G2').value = 'TOTAL (semanal)';
    sheet.getCell('G2').font = {bold: true};

    sheet.getCell('L2').value = 'TOTAL (mensual)';
    sheet.getCell('L2').font = {bold: true};
}

async function setPrimaryTokenDealsSheet(
    sheet: any,
    timeLow: number,
    timeHigh: number,
    monthIndex: number,
    year: number,
    toMonthIndex: number,
    toYear: number,
    url: string,
    token: any,
    hideNames: boolean = true,
) {
    //define vars
    let day = 1;
    let week = 1;
    let month = 1;
    let dayCounter = 0;
    let weekCounter = 0;
    let monthCounter = 0;
    let weekRates = 0;
    let monthRates = 0;
    let weekZeros = 0;
    let monthZeros = 0;
    let _timeLow = timeLow;
    let _timeHigh = _timeLow + ONE_UTC_DAY;
    let dayRows = [];
    let weekRows = [];
    let monthRows = [];
    let offersRows = [];
    let requestsRows = [];

    let dayOffers = await try_getOffersPrimary(timeLow, timeHigh, token.address, url);
    let dayRequests = await try_getRequestsPrimary(timeLow, timeHigh, token.address, url);

    //rates: array[31] with USD price (padded with 0s)
    let rates = await getDayRate(
        year, 
        monthIndex, 
        toYear, 
        toMonthIndex, 
        token.address,
        token.category
    );

    let nextOffer: any;
    let nextTimestamp: number;
    let nextIsOffer: boolean;

    if ((dayOffers.length == 0) && (dayRequests.length > 0)) {
        nextOffer = dayRequests.pop();
        nextTimestamp = nextOffer.timestamp;
        nextIsOffer = false;
    } else if ((dayRequests.length == 0) && (dayOffers.length > 0)) {
        nextOffer = dayOffers.pop();
        nextTimestamp = nextOffer.timestamp;
        nextIsOffer = true;
    } else if ((dayOffers.length > 0) || (dayRequests.length > 0)) {
        let nextOfferTimestamp = dayOffers[dayOffers.length - 1].timestamp;
        let nextRequestTimestamp = dayRequests[dayRequests.length - 1].timestamp;

        if (nextOfferTimestamp < nextRequestTimestamp) {
            nextOffer = dayOffers.pop();
            nextTimestamp = nextOffer.timestamp;
            nextIsOffer = true;
        } else {
            nextOffer = dayRequests.pop();
            nextTimestamp = nextOffer.timestamp;
            nextIsOffer = false;
        }
    } else {
        nextTimestamp = 0;
    }

    while (_timeHigh <= timeHigh) {

        while ((_timeLow < nextTimestamp) && (nextTimestamp < _timeHigh)) {
            //compute offer
            if (nextOffer.deals.length > 0) {
                if (nextIsOffer) {
                    //COMPUTE OFFER
                    let deals = nextOffer.deals;
                    for (let q = 0; q < deals.length; q++) {
                        //1 DEAL per iteration
                        let amount = parseFloat(weiToEther(deals[q].sellAmount));
                        dayCounter = dayCounter + amount;
                        weekCounter = weekCounter + amount;
                        monthCounter = monthCounter + amount;

                        //DEALS TABLE
                        let array = [];

                        array.push(new Date(deals[q].timestamp * 1000));
                        array.push(timeConverter(deals[q].offer.timestamp));
                        array.push(timeConverter(deals[q].timestamp));
                        array.push(deals[q].offer.buyToken.tokenSymbol);

                        if (!hideNames) {
                            if (deals[q].seller.name == null) {
                                array.push("");
                            } else {
                                array.push(deals[q].seller.name);
                            }
    
                            if (deals[q].buyer.name == null) {
                                array.push("");
                            } else {
                                array.push(deals[q].buyer.name);
                            }
                        } else {
                            array.push(deals[q].seller.id);
                            array.push(deals[q].buyer.id);
                        }

                        array.push(parseFloat(weiToEther(deals[q].sellAmount)));
                        array.push(parseFloat(weiToEther(deals[q].buyAmount)));
                        offersRows.push(array);
                        //1 DEAL per iteration
                    }
                } else {
                    //COMPUTE REQUEST
                    let deals = nextOffer.deals;
                    for (let q = 0; q < deals.length; q++) {
                        let amount = parseFloat(weiToEther(deals[q].buyAmount));
                        dayCounter = dayCounter + amount;
                        weekCounter = weekCounter + amount;
                        monthCounter = monthCounter + amount;

                        let array = [];

                        array.push(new Date(deals[q].timestamp * 1000));
                        array.push(timeConverter(deals[q].offer.timestamp));
                        array.push(timeConverter(deals[q].timestamp));
                        array.push(deals[q].offer.sellToken.tokenSymbol);

                        if (!hideNames) {
                            if (deals[q].seller.name == null) {
                                array.push("");
                            } else {
                                array.push(deals[q].seller.name);
                            }
    
                            if (deals[q].buyer.name == null) {
                                array.push("");
                            } else {
                                array.push(deals[q].buyer.name);
                            }
                        } else {
                            array.push(deals[q].seller.id);
                            array.push(deals[q].buyer.id);
                        }

                        array.push(parseFloat(weiToEther(deals[q].buyAmount)));
                        array.push(parseFloat(weiToEther(deals[q].sellAmount)));
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
            } else if ((dayRequests.length == 0) && (dayOffers.length > 0)) {
                nextOffer = dayOffers.pop();
                nextTimestamp = nextOffer.timestamp;
                nextIsOffer = true;
            } else if ((dayOffers.length > 0) || (dayRequests.length > 0)) {
                let nextOfferTimestamp = dayOffers[dayOffers.length - 1].timestamp;
                let nextRequestTimestamp = dayRequests[dayRequests.length - 1].timestamp;
    
                if (nextOfferTimestamp < nextRequestTimestamp) {
                    nextOffer = dayOffers.pop();
                    nextTimestamp = nextOffer.timestamp;
                    nextIsOffer = true;
                } else {
                    nextOffer = dayRequests.pop();
                    nextTimestamp = nextOffer.timestamp;
                    nextIsOffer = false;
                }
            } else {
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
            if ((7 - weekZeros) == 0){
                weekRates = 0;
            } else {
                weekRates = weekRates / (7 - weekZeros);
            }

            //compute day
            let weekRow = [];

            weekRow.push(week);
            weekRow.push(weekCounter);
            weekRow.push(weekCounter * weekRates);
            weekRow.push(weekRates);
            weekRows.push(weekRow);

            weekCounter = 0;
            weekRates = 0
            weekZeros = 0;
            week++;
        }

        let dayRow = [];

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

    //5th week...days (29-31)
    let weekRow = [];

    //calc 5th week rates
    if ((day - 29 - weekZeros) == 0){
        weekRates = 0;
    } else {
        weekRates = weekRates / (day - 29 - weekZeros);
    }

    weekRow.push(week);
    weekRow.push(weekCounter);
    weekRow.push(weekCounter * weekRates);
    weekRow.push(weekRates);
    weekRows.push(weekRow);

    //MONTH
    let monthRow = [];

    if ((day - 1 - monthZeros) == 0){
        monthRates = 0;
    } else {
        monthRates = monthRates / (day - 1 - monthZeros);
    }

    monthRow.push(month);
    monthRow.push(monthCounter);
    monthRow.push(monthCounter * monthRates);
    monthRow.push(monthRates);
    monthRows.push(monthRow);

    //ADD TABLES
    let tableDayPrimary = 'TablaDayPrimary' + token.symbol;
    let tableWeekPrimary = 'TablaWeekPrimary' + token.symbol;
    let tableMonthPrimary = 'TablaMonthPrimary' + token.symbol;

    addTable(
        sheet,
        tableDayPrimary,
        'B3',
        [
            {name: 'Día', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'},
            {name: 'Monto (USD)', totalsRowFunction: 'sum'},
            {name: 'Tipo de cambio'}
        ],
        dayRows
    );

    addTable(
        sheet,
        tableWeekPrimary,
        'G3',
        [
            {name: 'Semana', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'},
            {name: 'Monto (USD)', totalsRowFunction: 'sum'},
            {name: 'Tipo de cambio'}
        ],
        weekRows
    );

    addTable(
        sheet,
        tableMonthPrimary,
        'L3',
        [
            {name: 'Mes', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'},
            {name: 'Monto (USD)', totalsRowFunction: 'sum'},
            {name: 'Tipo de cambio'}
        ],
        monthRows
    );

    sheet.getCell('B36').value = 'PACTOS (' + token.symbol + ' OFERTADO)';
    sheet.getCell('B36').font = {bold: true};
    let tableName3 = 'TablaPrimario' + token.symbol;

    if (offersRows.length == 0) {
        offersRows = getEmtpyDeal();
    }

    addTable(
        sheet,
        tableName3,
        'B37',
        [
            {name: 'Fecha (pacto)', filterButton: true},
            {name: 'Hora (oferta)'},
            {name: 'Hora (pacto)'},
            {name: 'Contrapartida', filterButton: true},
            {name: 'Vendedor', filterButton: true},
            {name: 'Comprador', filterButton: true},
            {name: 'Monto pactado (primario) (' + token.symbol + ')', totalsRowFunction: 'sum'},
            {name: 'Monto contrapartida', totalsRowFunction: 'sum'}
        ],
        offersRows
    );

    sheet.getCell('K36').value = token.symbol + ' DEMANDADO';
    sheet.getCell('K36').font = {bold: true};
    let tableName4 = 'TablaPrimario2' + token.symbol;

    if (requestsRows.length == 0) {
        requestsRows = getEmtpyDeal();
    }

    addTable(
        sheet,
        tableName4,
        'K37',
        [
            {name: 'Fecha (pacto)', filterButton: true},
            {name: 'Hora (oferta)'},
            {name: 'Hora (pacto)'},
            {name: 'Contrapartida', filterButton: true},
            {name: 'Vendedor', filterButton: true},
            {name: 'Comprador', filterButton: true},
            {name: 'Monto pactado (primario) (' + token.symbol + ')', totalsRowFunction: 'sum'},
            {name: 'Monto contrapartida', totalsRowFunction: 'sum'}
        ],
        requestsRows
    );

    sheet.getCell('C1').value = 'Mercado P2P (Primario)';
    sheet.getCell('C1').font = {bold: true};

    sheet.getCell('B2').value = 'TOTAL (diario)';
    sheet.getCell('B2').font = {bold: true};
    
    sheet.getCell('G2').value = 'TOTAL (semanal)';
    sheet.getCell('G2').font = {bold: true};

    sheet.getCell('L2').value = 'TOTAL (mensual)';
    sheet.getCell('L2').font = {bold: true};
}

async function setPackableDealsSheet(
    sheet: any,
    timeLow: number,
    timeHigh: number,
    url: string,
    token: any,
    hideNames: boolean = true,
) {
    //define vars
    let day = 1;
    let week = 1;
    let month = 1;
    let dayCounter = 0;
    let weekCounter = 0;
    let monthCounter = 0;
    let dayCounterUsd = 0;
    let weekCounterUsd = 0;
    let monthCounterUsd = 0;
    let _timeLow = timeLow;
    let _timeHigh = _timeLow + ONE_UTC_DAY;
    let dayRows = [];
    let weekRows = [];
    let monthRows = [];
    let offersRows = [];
    let requestsRows = [];

    let dayOffers = await try_getPackableOffers(timeLow, timeHigh, token.address, url);
    let dayRequests = await try_getPackableRequests(timeLow, timeHigh, token.address, url);

    let nextOffer: any;
    let nextTimestamp: number;
    let nextIsOffer: boolean;

    if ((dayOffers.length == 0) && (dayRequests.length > 0)) {
        nextOffer = dayRequests.pop();
        nextTimestamp = nextOffer.timestamp;
        nextIsOffer = false;
    } else if ((dayRequests.length == 0) && (dayOffers.length > 0)) {
        nextOffer = dayOffers.pop();
        nextTimestamp = nextOffer.timestamp;
        nextIsOffer = true;
    } else if ((dayOffers.length > 0) || (dayRequests.length > 0)) {
        let nextOfferTimestamp = dayOffers[dayOffers.length - 1].timestamp;
        let nextRequestTimestamp = dayRequests[dayRequests.length - 1].timestamp;

        if (nextOfferTimestamp < nextRequestTimestamp) {
            nextOffer = dayOffers.pop();
            nextTimestamp = nextOffer.timestamp;
            nextIsOffer = true;
        } else {
            nextOffer = dayRequests.pop();
            nextTimestamp = nextOffer.timestamp;
            nextIsOffer = false;
        }
    } else {
        nextTimestamp = 0;
    }

    while (_timeHigh <= timeHigh) {

        while ((_timeLow < nextTimestamp) && (nextTimestamp < _timeHigh)) {
            //compute offer
            if (nextOffer.deals.length > 0) {
                if (nextIsOffer) {
                    //COMPUTE OFFER
                    let deals = nextOffer.deals;
                    for (let q = 0; q < deals.length; q++) {
                        //1 DEAL per iteration
                        let amount = parseFloat(weiToEther(deals[q].sellAmount));
                        let buyAmount = parseFloat(weiToEther(deals[q].buyAmount));
                        dayCounter = dayCounter + amount;
                        weekCounter = weekCounter + amount;
                        monthCounter = monthCounter + amount;

                        let usdAmount = 0;

                        if (
                            (deals[q].offer.buyToken.id == Constants.USD.address) ||
                            (deals[q].offer.buyToken.id == Constants.USC.address) ||
                            (deals[q].offer.buyToken.id == Constants.PEL.address)
                        ) {
                            usdAmount = buyAmount;
                        } else {
                            usdAmount = await convertToUsd(
                                buyAmount, 
                                deals[q].offer.buyToken.id,
                                deals[q].timestamp
                            );
                        }

                        dayCounterUsd = dayCounterUsd + usdAmount;
                        weekCounterUsd = weekCounterUsd + usdAmount;
                        monthCounterUsd = monthCounterUsd + usdAmount;

                        //DEALS TABLE
                        let array = [];

                        array.push(new Date(deals[q].timestamp * 1000));
                        array.push(timeConverter(deals[q].offer.timestamp));
                        array.push(timeConverter(deals[q].timestamp));
                        array.push(deals[q].offer.buyToken.tokenSymbol);

                        if (!hideNames) {
                            if (deals[q].seller.name == null) {
                                array.push("");
                            } else {
                                array.push(deals[q].seller.name);
                            }
    
                            if (deals[q].buyer.name == null) {
                                array.push("");
                            } else {
                                array.push(deals[q].buyer.name);
                            }
                        } else {
                            array.push(deals[q].seller.id);
                            array.push(deals[q].buyer.id);
                        }

                        array.push(parseFloat(weiToEther(deals[q].sellAmount)));
                        array.push(parseFloat(weiToEther(deals[q].buyAmount)));
                        offersRows.push(array);
                        //1 DEAL per iteration
                    }
                } else {
                    //COMPUTE REQUEST
                    let deals = nextOffer.deals;
                    for (let q = 0; q < deals.length; q++) {
                        let amount = parseFloat(weiToEther(deals[q].buyAmount));
                        let sellAmount = parseFloat(weiToEther(deals[q].sellAmount));
                        dayCounter = dayCounter + amount;
                        weekCounter = weekCounter + amount;
                        monthCounter = monthCounter + amount;

                        let usdAmount = 0;

                        if (
                            (deals[q].offer.sellToken.id == Constants.USD.address) ||
                            (deals[q].offer.sellToken.id == Constants.USC.address) ||
                            (deals[q].offer.sellToken.id == Constants.PEL.address)
                        ) {
                            usdAmount = sellAmount;
                        } else {
                            usdAmount = await convertToUsd(
                                sellAmount, 
                                deals[q].offer.sellToken.id,
                                deals[q].timestamp
                            );
                        }

                        dayCounterUsd = dayCounterUsd + usdAmount;
                        weekCounterUsd = weekCounterUsd + usdAmount;
                        monthCounterUsd = monthCounterUsd + usdAmount;

                        let array = [];

                        array.push(new Date(deals[q].timestamp * 1000));
                        array.push(timeConverter(deals[q].offer.timestamp));
                        array.push(timeConverter(deals[q].timestamp));
                        array.push(deals[q].offer.sellToken.tokenSymbol);

                        if (!hideNames) {
                            if (deals[q].seller.name == null) {
                                array.push("");
                            } else {
                                array.push(deals[q].seller.name);
                            }
    
                            if (deals[q].buyer.name == null) {
                                array.push("");
                            } else {
                                array.push(deals[q].buyer.name);
                            }
                        } else {
                            array.push(deals[q].seller.id);
                            array.push(deals[q].buyer.id);
                        }

                        array.push(parseFloat(weiToEther(deals[q].buyAmount)));
                        array.push(parseFloat(weiToEther(deals[q].sellAmount)));
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
            } else if ((dayRequests.length == 0) && (dayOffers.length > 0)) {
                nextOffer = dayOffers.pop();
                nextTimestamp = nextOffer.timestamp;
                nextIsOffer = true;
            } else if ((dayOffers.length > 0) || (dayRequests.length > 0)) {
                let nextOfferTimestamp = dayOffers[dayOffers.length - 1].timestamp;
                let nextRequestTimestamp = dayRequests[dayRequests.length - 1].timestamp;
    
                if (nextOfferTimestamp < nextRequestTimestamp) {
                    nextOffer = dayOffers.pop();
                    nextTimestamp = nextOffer.timestamp;
                    nextIsOffer = true;
                } else {
                    nextOffer = dayRequests.pop();
                    nextTimestamp = nextOffer.timestamp;
                    nextIsOffer = false;
                }
            } else {
                nextTimestamp = 0;
            }
        }

        //compute week
        if (day == 7 * week) {
            //WEEK
            let weekRow = [];
            //secondary
            weekRow.push(week);
            weekRow.push(weekCounter);
            weekRow.push(weekCounterUsd);
            if (weekCounter == 0) weekCounter = 1;
            weekRow.push(weekCounterUsd / weekCounter);
            weekRows.push(weekRow);

            weekCounter = 0;
            weekCounterUsd = 0;
            week++;
        }

        //compute day
        let dayRow = [];

        dayRow.push(day);
        dayRow.push(dayCounter);
        dayRow.push(dayCounterUsd);
        if (dayCounter == 0) dayCounter = 1;
        dayRow.push(dayCounterUsd / dayCounter);
        dayRows.push(dayRow);

        dayCounter = 0;
        dayCounterUsd = 0;

        day++;
        _timeLow = _timeHigh;
        _timeHigh = _timeLow + ONE_UTC_DAY;
    }

    //5th week...days (29-31)
    let weekRow = [];
    weekRow.push(week);
    weekRow.push(weekCounter);
    weekRow.push(weekCounterUsd);
    if (weekCounter == 0) weekCounter = 1;
    weekRow.push(weekCounterUsd / weekCounter);
    weekRows.push(weekRow);

    //MONTH
    let monthRow = [];
    monthRow.push(month);
    monthRow.push(monthCounter);
    monthRow.push(monthCounterUsd);
    if (monthCounter == 0) monthCounter = 1;
    monthRow.push(monthCounterUsd / monthCounter);
    monthRows.push(monthRow);

    //ADD TABLES
    let tableDay = 'TablaDay' + token.symbol;
    let tableWeek = 'TablaWeek' + token.symbol;
    let tableMonth = 'TablaMonth' + token.symbol;

    addTable(
        sheet,
        tableDay,
        'B3',
        [
            {name: 'Día', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'},
            {name: 'Monto (USD)', totalsRowFunction: 'sum'},
            {name: 'Tipo de cambio'}
        ],
        dayRows
    );

    addTable(
        sheet,
        tableWeek,
        'G3',
        [
            {name: 'Semana', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'},
            {name: 'Monto (USD)', totalsRowFunction: 'sum'},
            {name: 'Tipo de cambio'}
        ],
        weekRows
    );

    addTable(
        sheet,
        tableMonth,
        'L3',
        [
            {name: 'Mes', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'},
            {name: 'Monto (USD)', totalsRowFunction: 'sum'},
            {name: 'Tipo de cambio'}
        ],
        monthRows
    );

    sheet.getCell('B36').value = 'PACTOS (' + token.symbol + ' OFERTADO)';
    sheet.getCell('B36').font = {bold: true};
    let tableName = 'Tabla' + token.symbol;

    if (offersRows.length == 0) {
        offersRows = getEmtpyDeal();
    }

    addTable(
        sheet,
        tableName,
        'B37',
        [
            {name: 'Fecha (pacto)', filterButton: true},
            {name: 'Hora (oferta)'},
            {name: 'Hora (pacto)'},
            {name: 'Contrapartida', filterButton: true},
            {name: 'Vendedor', filterButton: true},
            {name: 'Comprador', filterButton: true},
            {name: 'Monto pactado (' + token.symbol + ')', totalsRowFunction: 'sum'},
            {name: 'Monto contrapartida', totalsRowFunction: 'sum'}
        ],
        offersRows
    );

    sheet.getCell('K36').value = 'PACTOS (' + token.symbol + ' DEMANDADO)';
    sheet.getCell('K36').font = {bold: true};
    let tableName2 = 'Tabla2' + token.symbol;

    if (requestsRows.length == 0) {
        requestsRows = getEmtpyDeal();
    }

    addTable(
        sheet,
        tableName2,
        'K37',
        [
            {name: 'Fecha (pacto)', filterButton: true},
            {name: 'Hora (oferta)'},
            {name: 'Hora (pacto)'},
            {name: 'Contrapartida', filterButton: true},
            {name: 'Vendedor', filterButton: true},
            {name: 'Comprador', filterButton: true},
            {name: 'Monto pactado (' + token.symbol + ')', totalsRowFunction: 'sum'},
            {name: 'Monto contrapartida', totalsRowFunction: 'sum'}
        ],
        requestsRows
    );

    sheet.getCell('C1').value = 'Mercado P2P (Secundario)';
    sheet.getCell('C1').font = {bold: true};

    sheet.getCell('B2').value = 'TOTAL (diario)';
    sheet.getCell('B2').font = {bold: true};
    
    sheet.getCell('G2').value = 'TOTAL (semanal)';
    sheet.getCell('G2').font = {bold: true};

    sheet.getCell('L2').value = 'TOTAL (mensual)';
    sheet.getCell('L2').font = {bold: true};
}

async function setPrimaryPackableDealsSheet(
    sheet: any,
    timeLow: number,
    timeHigh: number,
    url: string,
    token: any,
    hideNames: boolean = true,
) {
    //define vars
    let day = 1;
    let week = 1;
    let month = 1;
    let dayCounter = 0;
    let weekCounter = 0;
    let monthCounter = 0;
    let dayCounterUsd = 0;
    let weekCounterUsd = 0;
    let monthCounterUsd = 0;
    let _timeLow = timeLow;
    let _timeHigh = _timeLow + ONE_UTC_DAY;
    let dayRows = [];
    let weekRows = [];
    let monthRows = [];
    let offersRows = [];
    let requestsRows = [];

    let dayOffers = await try_getPackableOffersPrimary(timeLow, timeHigh, token.address, url);
    let dayRequests = await try_getPackableRequestsPrimary(timeLow, timeHigh, token.address, url);

    let nextOffer: any;
    let nextTimestamp: number;
    let nextIsOffer: boolean;

    if ((dayOffers.length == 0) && (dayRequests.length > 0)) {
        nextOffer = dayRequests.pop();
        nextTimestamp = nextOffer.timestamp;
        nextIsOffer = false;
    } else if ((dayRequests.length == 0) && (dayOffers.length > 0)) {
        nextOffer = dayOffers.pop();
        nextTimestamp = nextOffer.timestamp;
        nextIsOffer = true;
    } else if ((dayOffers.length > 0) || (dayRequests.length > 0)) {
        let nextOfferTimestamp = dayOffers[dayOffers.length - 1].timestamp;
        let nextRequestTimestamp = dayRequests[dayRequests.length - 1].timestamp;

        if (nextOfferTimestamp < nextRequestTimestamp) {
            nextOffer = dayOffers.pop();
            nextTimestamp = nextOffer.timestamp;
            nextIsOffer = true;
        } else {
            nextOffer = dayRequests.pop();
            nextTimestamp = nextOffer.timestamp;
            nextIsOffer = false;
        }
    } else {
        nextTimestamp = 0;
    }

    while (_timeHigh <= timeHigh) {

        while ((_timeLow < nextTimestamp) && (nextTimestamp < _timeHigh)) {
            //compute offer
            if (nextOffer.deals.length > 0) {
                if (nextIsOffer) {
                    //COMPUTE OFFER
                    let deals = nextOffer.deals;
                    for (let q = 0; q < deals.length; q++) {
                        //1 DEAL per iteration
                        let amount = parseFloat(weiToEther(deals[q].sellAmount));
                        let buyAmount = parseFloat(weiToEther(deals[q].buyAmount));
                        dayCounter = dayCounter + amount;
                        weekCounter = weekCounter + amount;
                        monthCounter = monthCounter + amount;

                        let usdAmount = 0;

                        if (
                            (deals[q].offer.buyToken.id == Constants.USD.address) ||
                            (deals[q].offer.buyToken.id == Constants.USC.address) ||
                            (deals[q].offer.buyToken.id == Constants.PEL.address)
                        ) {
                            usdAmount = buyAmount;
                        } else {
                            usdAmount = await convertToUsd(
                                buyAmount, 
                                deals[q].offer.buyToken.id,
                                deals[q].timestamp
                            );
                        }

                        dayCounterUsd = dayCounterUsd + usdAmount;
                        weekCounterUsd = weekCounterUsd + usdAmount;
                        monthCounterUsd = monthCounterUsd + usdAmount;

                        //DEALS TABLE
                        let array = [];

                        array.push(new Date(deals[q].timestamp * 1000));
                        array.push(timeConverter(deals[q].offer.timestamp));
                        array.push(timeConverter(deals[q].timestamp));
                        array.push(deals[q].offer.buyToken.tokenSymbol);

                        if (!hideNames) {
                            if (deals[q].seller.name == null) {
                                array.push("");
                            } else {
                                array.push(deals[q].seller.name);
                            }
    
                            if (deals[q].buyer.name == null) {
                                array.push("");
                            } else {
                                array.push(deals[q].buyer.name);
                            }
                        } else {
                            array.push(deals[q].seller.id);
                            array.push(deals[q].buyer.id);
                        }

                        array.push(parseFloat(weiToEther(deals[q].sellAmount)));
                        array.push(parseFloat(weiToEther(deals[q].buyAmount)));
                        offersRows.push(array);
                        //1 DEAL per iteration
                    }
                } else {
                    //COMPUTE REQUEST
                    let deals = nextOffer.deals;
                    for (let q = 0; q < deals.length; q++) {
                        let amount = parseFloat(weiToEther(deals[q].buyAmount));
                        let sellAmount = parseFloat(weiToEther(deals[q].sellAmount));
                        dayCounter = dayCounter + amount;
                        weekCounter = weekCounter + amount;
                        monthCounter = monthCounter + amount;

                        let usdAmount = 0;

                        if (
                            (deals[q].offer.sellToken.id == Constants.USD.address) ||
                            (deals[q].offer.sellToken.id == Constants.USC.address) ||
                            (deals[q].offer.sellToken.id == Constants.PEL.address)
                        ) {
                            usdAmount = sellAmount;
                        } else {
                            usdAmount = await convertToUsd(
                                sellAmount, 
                                deals[q].offer.sellToken.id,
                                deals[q].timestamp
                            );
                        }

                        dayCounterUsd = dayCounterUsd + usdAmount;
                        weekCounterUsd = weekCounterUsd + usdAmount;
                        monthCounterUsd = monthCounterUsd + usdAmount;

                        let array = [];

                        array.push(new Date(deals[q].timestamp * 1000));
                        array.push(timeConverter(deals[q].offer.timestamp));
                        array.push(timeConverter(deals[q].timestamp));
                        array.push(deals[q].offer.sellToken.tokenSymbol);

                        if (!hideNames) {
                            if (deals[q].seller.name == null) {
                                array.push("");
                            } else {
                                array.push(deals[q].seller.name);
                            }
    
                            if (deals[q].buyer.name == null) {
                                array.push("");
                            } else {
                                array.push(deals[q].buyer.name);
                            }
                        } else {
                            array.push(deals[q].seller.id);
                            array.push(deals[q].buyer.id);
                        }

                        array.push(parseFloat(weiToEther(deals[q].buyAmount)));
                        array.push(parseFloat(weiToEther(deals[q].sellAmount)));
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
            } else if ((dayRequests.length == 0) && (dayOffers.length > 0)) {
                nextOffer = dayOffers.pop();
                nextTimestamp = nextOffer.timestamp;
                nextIsOffer = true;
            } else if ((dayOffers.length > 0) || (dayRequests.length > 0)) {
                let nextOfferTimestamp = dayOffers[dayOffers.length - 1].timestamp;
                let nextRequestTimestamp = dayRequests[dayRequests.length - 1].timestamp;
    
                if (nextOfferTimestamp < nextRequestTimestamp) {
                    nextOffer = dayOffers.pop();
                    nextTimestamp = nextOffer.timestamp;
                    nextIsOffer = true;
                } else {
                    nextOffer = dayRequests.pop();
                    nextTimestamp = nextOffer.timestamp;
                    nextIsOffer = false;
                }
            } else {
                nextTimestamp = 0;
            }
        }

        //compute week
        if (day == 7 * week) {
            //WEEK
            let weekRow = [];
            weekRow.push(week);
            weekRow.push(weekCounter);
            weekRow.push(weekCounterUsd);
            if (weekCounter == 0) weekCounter = 1;
            weekRow.push(weekCounterUsd / weekCounter);
            weekRows.push(weekRow);

            weekCounter = 0;
            weekCounterUsd = 0;
            week++;
        }

        //compute day
        let dayRow = [];

        dayRow.push(day);
        dayRow.push(dayCounter);
        dayRow.push(dayCounterUsd);
        if (dayCounter == 0) dayCounter = 1;
        dayRow.push(dayCounterUsd / dayCounter);
        dayRows.push(dayRow);

        dayCounter = 0;
        dayCounterUsd = 0;

        day++;
        _timeLow = _timeHigh;
        _timeHigh = _timeLow + ONE_UTC_DAY;
    }

    //5th week...days (29-31)
    let weekRow = [];
    weekRow.push(week);
    weekRow.push(weekCounter);
    weekRow.push(weekCounterUsd);
    if (weekCounter == 0) weekCounter = 1;
    weekRow.push(weekCounterUsd / weekCounter);
    weekRows.push(weekRow);

    //MONTH
    let monthRow = [];
    monthRow.push(month);
    monthRow.push(monthCounter);
    monthRow.push(monthCounterUsd);
    if (monthCounter == 0) monthCounter = 1;
    monthRow.push(monthCounterUsd / monthCounter);
    monthRows.push(monthRow);

    //ADD TABLES
    let tableDayPrimary = 'TablaDayPrimary' + token.symbol;
    let tableWeekPrimary = 'TablaWeekPrimary' + token.symbol;
    let tableMonthPrimary = 'TablaMonthPrimary' + token.symbol;

    addTable(
        sheet,
        tableDayPrimary,
        'B3',
        [
            {name: 'Día', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'},
            {name: 'Monto (USD)', totalsRowFunction: 'sum'},
            {name: 'Tipo de cambio'}
        ],
        dayRows
    );

    addTable(
        sheet,
        tableWeekPrimary,
        'G3',
        [
            {name: 'Semana', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'},
            {name: 'Monto (USD)', totalsRowFunction: 'sum'},
            {name: 'Tipo de cambio'}
        ],
        weekRows
    );

    addTable(
        sheet,
        tableMonthPrimary,
        'L3',
        [
            {name: 'Mes', filterButton: true},
            {name: 'Monto', totalsRowFunction: 'sum'},
            {name: 'Monto (USD)', totalsRowFunction: 'sum'},
            {name: 'Tipo de cambio'}
        ],
        monthRows
    );

    sheet.getCell('B36').value = 'PACTOS (' + token.symbol + ' OFERTADO)';
    sheet.getCell('B36').font = {bold: true};
    let tableName3 = 'TablaPrimario' + token.symbol;

    if (offersRows.length == 0) {
        offersRows = getEmtpyDeal();
    }

    addTable(
        sheet,
        tableName3,
        'B37',
        [
            {name: 'Fecha (pacto)', filterButton: true},
            {name: 'Hora (oferta)'},
            {name: 'Hora (pacto)'},
            {name: 'Contrapartida', filterButton: true},
            {name: 'Vendedor', filterButton: true},
            {name: 'Comprador', filterButton: true},
            {name: 'Monto pactado (primario) (' + token.symbol + ')', totalsRowFunction: 'sum'},
            {name: 'Monto contrapartida', totalsRowFunction: 'sum'}
        ],
        offersRows
    );

    sheet.getCell('K36').value = token.symbol + ' DEMANDADO';
    sheet.getCell('K36').font = {bold: true};
    let tableName4 = 'TablaPrimario2' + token.symbol;

    if (requestsRows.length == 0) {
        requestsRows = getEmtpyDeal();
    }

    addTable(
        sheet,
        tableName4,
        'K37',
        [
            {name: 'Fecha (pacto)', filterButton: true},
            {name: 'Hora (oferta)'},
            {name: 'Hora (pacto)'},
            {name: 'Contrapartida', filterButton: true},
            {name: 'Vendedor', filterButton: true},
            {name: 'Comprador', filterButton: true},
            {name: 'Monto pactado (primario) (' + token.symbol + ')', totalsRowFunction: 'sum'},
            {name: 'Monto contrapartida', totalsRowFunction: 'sum'}
        ],
        requestsRows
    );

    sheet.getCell('C1').value = 'Mercado P2P (Primario)';
    sheet.getCell('C1').font = {bold: true};

    sheet.getCell('B2').value = 'TOTAL (diario)';
    sheet.getCell('B2').font = {bold: true};
    
    sheet.getCell('G2').value = 'TOTAL (semanal)';
    sheet.getCell('G2').font = {bold: true};

    sheet.getCell('L2').value = 'TOTAL (mensual)';
    sheet.getCell('L2').font = {bold: true};
}

async function setBalancesTable(
    sheet: any,
    balances: any[],
    tableName: string,
    tableCell: string
) {
    let balanceRows = [];
    for (let k = 0; k < balances.length; k++) {
        let array = [];

        if (balances[k].token.tokenKind == 1) {
            array.push(balances[k].token.tokenSymbol);
            array.push(parseFloat(weiToEther(balances[k].balance)));
            balanceRows.push(array);
        } else if (balances[k].token.tokenKind == 2) {
            array.push(balances[k].token.tokenSymbol);
            array.push(parseFloat(weiToEther(balances[k].balance)));
            balanceRows.push(array);
        } else if (balances[k].token.tokenKind == 3) {
            let symbolName = balances[k].token.tokenSymbol;
            let packables = balances[k].packables[0].balances;

            for (let m = 0; m < packables.length; m++) {
                let expiry = timeConverter(packables[m].packableId.metadata[0]);
                let symbol = String(symbolName).concat(" ").concat(expiry);
                array.push(symbol);
                array.push(parseInt(weiToEther(packables[m].balance)));
                balanceRows.push(array);
                array = [];
            }
        }
    }

    addTable(
        sheet,
        tableName,
        tableCell,
        [
            {name: 'Activo'},
            {name: 'Saldo'}
        ],
        balanceRows
    );
}

async function setDexSheet(
    sheet: any,
    timeLow: number,
    timeHigh: number,
    instrument: any,
    dex: "dex" | "dex-bicentenario",
    url: string,
    hideNames: boolean = true
) {
    let deals = await try_getDexDeals(timeLow, timeHigh, instrument.pair, dex, url);

    let dealsRow = [];
    for (let i = 0; i < deals.length; i++) {
        let deal = deals[i];
        let dealRow = [];

        dealRow.push(new Date(deal.timestamp * 1000));

        if (deal.side == "1") {
            //amountA is in nominatorToken
            //amountB is in baseToken (PEL)
            //orderA-SELL & orderB-BUY
            
            //SELLER
            if (!hideNames) {
                if (deal.orderA.owner.name == null) {
                    dealRow.push("");
                } else {
                    dealRow.push(deal.orderA.owner.name);
                }
            } else {
                dealRow.push(deal.orderA.owner.id);
            }

            //BUYER
            if (!hideNames) {
                if (deal.orderB.owner.name == null) {
                    dealRow.push("");
                } else {
                    dealRow.push(deal.orderB.owner.name);
                }
            } else {
                dealRow.push(deal.orderB.owner.id);
            }

            //PRICE
            dealRow.push(parseFloat(weiToEther(deal.price)));

            //AMOUNT (in nominatorToken)
            dealRow.push(parseFloat(weiToEther(deal.amountA)));

            //AMOUNT (in baseToken aka PEL)
            dealRow.push(parseFloat(weiToEther(deal.amountB)));

        } else {
            //amountA is in baseToken (PEL)
            //amountB is in nominatorToken
            //orderA-BUY & orderB-SELL

            //SELLER
            if (!hideNames) {
                if (deal.orderB.owner.name == null) {
                    dealRow.push("");
                } else {
                    dealRow.push(deal.orderB.owner.name);
                }
            } else {
                dealRow.push(deal.orderB.owner.id);
            }

            //BUYER
            if (!hideNames) {
                if (deal.orderA.owner.name == null) {
                    dealRow.push("");
                } else {
                    dealRow.push(deal.orderA.owner.name);
                }
            } else {
                dealRow.push(deal.orderA.owner.id);
            }

            //PRICE
            dealRow.push(parseFloat(weiToEther(deal.price)));

            //AMOUNT (in nominatorToken)
            dealRow.push(parseFloat(weiToEther(deal.amountB)));

            //AMOUNT (in baseToken aka PEL)
            dealRow.push(parseFloat(weiToEther(deal.amountA)));
        }

        dealsRow.push(dealRow);
    }

    //TXs TABLE
    let tableName = 'Tabla' + instrument.symbol;

    if (dealsRow.length == 0) {
        dealsRow = [[new Date(), "", "", 0, 0, 0]];
    }

    addTable(
        sheet,
        tableName,
        'B2',
        [
            {name: 'Fecha', filterButton: true},
            {name: 'Vendedor', filterButton: true},
            {name: 'Comprador', filterButton: true},
            {name: 'Precio', totalsRowFunction: 'average'},
            {name: 'Cantidad', totalsRowFunction: 'sum'},
            {name: 'Cantidad (contrapartida)', totalsRowFunction: 'sum'}
        ],
        dealsRow
    );
}

async function try_getTransactions(
    _timeLow: number, 
    _timeHigh: number, 
    token: string,
    url: string,
    retries: number = 0,
    name?:string
) {
    let transactions: any;
    try {
        transactions = await getTransactions(_timeLow, _timeHigh, token, url);

        if (name == undefined) {
            transactions = await getTransactions(_timeLow, _timeHigh, token, url);
        } else {
            transactions = await getTransactionsByName(_timeLow, _timeHigh, token, name, url);
        }

        return transactions;
    } catch (error) {
        if (retries < 10) {
            retries++;
            console.log("-- REINTENTO DE QUERY: " + retries);  
            transactions = await try_getTransactions(_timeLow, _timeHigh, token, url, retries + 1);
            console.log("-- REINTENTO EXITOSO --");
            return transactions;
        } else {
            console.error(error);
            throw new Error(error);
        }
    }
}

async function try_getTransactionsFromArray(
    _timeLow: number, 
    _timeHigh: number, 
    token: string,
    addressesArray: string[],
    url: string,
    retries: number = 0
) {
    let transactions: any;
    try {
        transactions = await getTransactionsFromArray(_timeLow, _timeHigh, token, addressesArray, url);

        return transactions;
    } catch (error) {
        if (retries < 5) {
            console.log("-- REINTENTO DE QUERY: " + retries);  
            transactions = await try_getTransactionsFromArray(_timeLow, _timeHigh, token, addressesArray, url, retries + 1);
            console.log("-- REINTENTO EXITOSO --");
            return transactions;
        } else {
            console.error(error);
            throw new Error(error);
        }
    }
}

async function try_getTransactionsToArray(
    _timeLow: number, 
    _timeHigh: number, 
    token: string,
    addressesArray: string[],
    url: string,
    retries: number = 0
) {
    let transactions: any;
    try {
        transactions = await getTransactionsToArray(_timeLow, _timeHigh, token, addressesArray, url);

        return transactions;
    } catch (error) {
        if (retries < 5) {
            console.log("-- REINTENTO DE QUERY: " + retries);  
            transactions = await try_getTransactionsToArray(_timeLow, _timeHigh, token, addressesArray, url, retries + 1);
            console.log("-- REINTENTO EXITOSO --");
            return transactions;
        } else {
            console.error(error);
            throw new Error(error);
        }
    }
}

async function getTransactions(
    _timeLow: number, 
    _timeHigh: number, 
    _tokenAddress: string,
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ transactions(first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + ', currency:"' + _tokenAddress + '"}, orderBy: timestamp, orderDirection: desc) { from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } }';
    let queryService = new Query('bank', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryTransactions = response.transactions;
    let transactions = queryTransactions;

    while(queryTransactions.length >= 1000) {
        skip = transactions.length;
        query = '{ transactions(first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + ', currency:"' + _tokenAddress + '"}, orderBy: timestamp, orderDirection: desc) { from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryTransactions = response.transactions;
        transactions = transactions.concat(queryTransactions);
    }

    return transactions;
}

async function getTransactionsFromArray(
    _timeLow: number, 
    _timeHigh: number, 
    _tokenAddress: string,
    _addressesArray: string[],
    _url: string = 'mainnet'
) {
    let skip = 0;
    let stringArray = _addressesArray.join('", "');
    let query = '{ transactions(first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + ', currency:"' + _tokenAddress + '", from_in:["'+ stringArray +'"]}, orderBy: timestamp, orderDirection: desc) { from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } }';
    let queryService = new Query('bank', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryTransactions = response.transactions;
    let transactions = queryTransactions;

    while(queryTransactions.length >= 1000) {
        skip = transactions.length;
        query = '{ transactions(first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + ', currency:"' + _tokenAddress + '", from_in:["'+ stringArray +'"]}, orderBy: timestamp, orderDirection: desc) { from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryTransactions = response.transactions;
        transactions = transactions.concat(queryTransactions);
    }

    return transactions;
}

async function getTransactionsToArray(
    _timeLow: number, 
    _timeHigh: number, 
    _tokenAddress: string,
    _addressesArray: string[],
    _url: string = 'mainnet'
) {
    let skip = 0;
    let stringArray = _addressesArray.join('", "');
    let query = '{ transactions(first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + ', currency:"' + _tokenAddress + '", to_in:["'+ stringArray +'"]}, orderBy: timestamp, orderDirection: desc) { from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } }';
    let queryService = new Query('bank', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryTransactions = response.transactions;
    let transactions = queryTransactions;

    while(queryTransactions.length >= 1000) {
        skip = transactions.length;
        query = '{ transactions(first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + ', currency:"' + _tokenAddress + '", to_in:["'+ stringArray +'"]}, orderBy: timestamp, orderDirection: desc) { from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryTransactions = response.transactions;
        transactions = transactions.concat(queryTransactions);
    }

    return transactions;
}

async function getAllTransactions(
    _timeLow: number, 
    _timeHigh: number, 
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ transactions(first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + '}, orderBy: timestamp, orderDirection: desc) { from { id identity {id} name { id } } to { id identity {id} name { id } } currency { tokenSymbol id tokenKind } amount timestamp } }';
    let queryService = new Query('bank', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryTransactions = response.transactions;
    let transactions = queryTransactions;

    while(queryTransactions.length >= 1000) {
        skip = transactions.length;
        query = '{ transactions(first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + '}, orderBy: timestamp, orderDirection: desc) { from { id identity {id} name { id } } to { id identity {id} name { id } } currency { tokenSymbol id tokenKind } amount timestamp } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryTransactions = response.transactions;
        transactions = transactions.concat(queryTransactions);
    }

    return transactions;
}

async function getTransactionsByName(
    _timeLow: number, 
    _timeHigh: number, 
    _tokenAddress: string,
    _name: string,
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ names(where:{id:"' + _name + '"}) { wallet { transactions (first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + ', currency:"' + _tokenAddress + '"} orderBy: timestamp, orderDirection: desc) { id from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } } } }';
    let queryService = new Query('bank', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryTransactions = response.names[0].wallet.transactions;
    let transactions = queryTransactions;

    while(queryTransactions.length >= 1000) {
        skip = transactions.length;
        query = '{ names(where:{id:"' + _name + '"}) { wallet { transactions (first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + ', currency:"' + _tokenAddress + '"} orderBy: timestamp, orderDirection: desc) { id from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryTransactions = response.names[0].wallet.transactions;
        transactions = transactions.concat(queryTransactions);
    }

    return transactions;
}

async function getAllTransactionsByName(
    _timeLow: number, 
    _timeHigh: number, 
    _name: string,
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ names(where:{id:"' + _name + '"}) { wallet { transactions (first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + '} orderBy: timestamp, orderDirection: desc) { id from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } } } }';
    let queryService = new Query('bank', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryTransactions = response.names[0].wallet.transactions;
    let transactions = queryTransactions;

    while(queryTransactions.length >= 1000) {
        skip = transactions.length;
        query = '{ names(where:{id:"' + _name + '"}) { wallet { transactions (first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + '} orderBy: timestamp, orderDirection: desc) { id from { id name { id } } to { id name { id } } currency { tokenSymbol id } amount timestamp } } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryTransactions = response.names[0].wallet.transactions;
        transactions = transactions.concat(queryTransactions);
    }

    return transactions;
}

async function try_getAllTransactionsByIdentity(
    _timeLow: number, 
    _timeHigh: number, 
    _identity: string,
    _url: string,
    retries: number = 0
) {
    let txsAndName: any;
    try {
        txsAndName = await getAllTransactionsByIdentity(_timeLow, _timeHigh, _identity, _url);
        return txsAndName;
    } catch (error) {
        if (retries < 10) {
            console.log("-- REINTENTO DE QUERY: " + retries);  
            txsAndName = await try_getAllTransactionsByIdentity(_timeLow, _timeHigh, _identity, _url, retries + 1);
            console.log("-- REINTENTO EXITOSO --");
            return txsAndName;
        } else {
            console.log("------------ SUPERAMOS REINTENTOS")
            console.error(error);
            throw new Error(error);
        }
    }
}

async function getAllTransactionsByIdentity(
    _timeLow: number, 
    _timeHigh: number, 
    _identity: string,
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ identity(id:"' + _identity + '") { wallet { name { id } transactions (first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + '} orderBy: timestamp, orderDirection: desc){ id from { id name { id } } to { id name { id } } currency { id tokenSymbol } amount timestamp } } } }';
    let queryService = new Query('bank', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryTransactions = response.identity.wallet.transactions;
    let transactions = queryTransactions;

    while(queryTransactions.length >= 1000) {
        skip = transactions.length;
        query = '{ identity(id:"' + _identity + '") { wallet { name { id } transactions (first: 1000, skip: ' + skip + ', where: {timestamp_gte: ' + _timeLow + ', timestamp_lte: ' + _timeHigh + '} orderBy: timestamp, orderDirection: desc){ id from { id name { id } } to { id name { id } } currency { id tokenSymbol } amount timestamp } } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryTransactions = response.identity.wallet.transactions;
        transactions = transactions.concat(queryTransactions);
    }

    return [transactions, response.identity.wallet.name.id];
}

async function try_getOffers(
    _timeLow: number, 
    _timeHigh: number, 
    token: string,
    url: string,
    retries: number = 0
) {
    let offers: any;
    try {
        offers = await getOffers(_timeLow, _timeHigh, token, url);
        return offers;
    } catch (error) {
        if (retries < 10) {
            retries++;
            console.log("-- REINTENTO DE QUERY: " + retries);  
            offers = await try_getOffers(_timeLow, _timeHigh, token, url, retries + 1);
            console.log("-- REINTENTO EXITOSO --");
            return offers;
        } else {
            console.error(error);
            throw new Error(error);
        }
    }
}

async function getOffers(
    _timeLow: number, 
    _timeHigh: number, 
    _tokensAddress: string,
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ offers (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
    let queryService = new Query('p2p', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryOffers = response.offers;
    let offers = queryOffers;

    while(queryOffers.length >= 1000) {
        skip = offers.length;
        query = '{ offers (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryOffers = response.offers;
        offers = offers.concat(queryOffers);
    }

    return offers;
}

async function getAllDeals(
    _timeLow: number, 
    _timeHigh: number, 
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ deals (where: {timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +', isSuccess:true}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } }';
    let queryService = new Query('p2p', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryOffers = response.deals;
    let offers = queryOffers;

    while(queryOffers.length >= 1000) {
        skip = offers.length;
        query = '{ deals (where: {timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +', isSuccess:true}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryOffers = response.deals;
        offers = offers.concat(queryOffers);
    }

    return offers;
}

async function getUserAllDeals(
    _nickname: string,
    _timeLow: number, 
    _timeHigh: number, 
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ users(where:{name:"' + _nickname + '"}) { deals (where:{timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy:timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { seller { id name } buyer { id name } offer { timestamp sellToken { id tokenSymbol } buyToken { id tokenSymbol } } sellAmount buyAmount timestamp } } }';
    let queryService = new Query('p2p', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryDeals = response.users[0].deals;
    let deals = queryDeals;

    while(queryDeals.length >= 1000) {
        skip = deals.length;
        let query = '{ users(where:{name:"' + _nickname + '"}) { deals (where:{timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy:timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { seller { id name } buyer { id name } offer { timestamp sellToken { id tokenSymbol } buyToken { id tokenSymbol } } sellAmount buyAmount timestamp } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryDeals = response.users[0].deals;
        deals = deals.concat(queryDeals);
    }

    return deals;
}

async function getUserPackableAllDeals(
    _nickname: string,
    _timeLow: number, 
    _timeHigh: number, 
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ users(where:{name:"' + _nickname + '"}) { packableDeals (where:{timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy:timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { seller { id name } buyer { id name } offer { timestamp sellToken { id tokenSymbol } buyToken { id tokenSymbol } } sellAmount buyAmount timestamp } } }';
    let queryService = new Query('p2p', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryDeals = response.users[0].packableDeals;
    let deals = queryDeals;

    while(queryDeals.length >= 1000) {
        skip = deals.length;
        let query = '{ users(where:{name:"' + _nickname + '"}) { packableDeals (where:{timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy:timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { seller { id name } buyer { id name } offer { timestamp sellToken { id tokenSymbol } buyToken { id tokenSymbol } } sellAmount buyAmount timestamp } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryDeals = response.users[0].packableDeals;
        deals = deals.concat(queryDeals);
    }

    return deals;
}

async function getUserAllDealsPrimary(
    _nickname: string,
    _timeLow: number, 
    _timeHigh: number, 
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ users(where:{name:"' + _nickname + '"}) { deals (where:{timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy:timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { seller { id name } buyer { id name } offer { timestamp sellToken { id tokenSymbol } buyToken { id tokenSymbol } } sellAmount buyAmount timestamp } } }';
    let queryService = new Query('p2p-primary', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryDeals = response.users[0].deals;
    let deals = queryDeals;

    while(queryDeals.length >= 1000) {
        skip = deals.length;
        let query = '{ users(where:{name:"' + _nickname + '"}) { deals (where:{timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy:timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { seller { id name } buyer { id name } offer { timestamp sellToken { id tokenSymbol } buyToken { id tokenSymbol } } sellAmount buyAmount timestamp } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryDeals = response.users[0].deals;
        deals = deals.concat(queryDeals);
    }

    return deals;
}

async function getUserPackableAllDealsPrimary(
    _nickname: string,
    _timeLow: number, 
    _timeHigh: number, 
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ users(where:{name:"' + _nickname + '"}) { packableDeals (where:{timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy:timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { seller { id name } buyer { id name } offer { timestamp sellToken { id tokenSymbol } buyToken { id tokenSymbol } } sellAmount buyAmount timestamp } } }';
    let queryService = new Query('p2p-primary', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryDeals = response.users[0].packableDeals;
    let deals = queryDeals;

    while(queryDeals.length >= 1000) {
        skip = deals.length;
        let query = '{ users(where:{name:"' + _nickname + '"}) { packableDeals (where:{timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + ', isSuccess:true}, orderBy:timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { seller { id name } buyer { id name } offer { timestamp sellToken { id tokenSymbol } buyToken { id tokenSymbol } } sellAmount buyAmount timestamp } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryDeals = response.users[0].packableDeals;
        deals = deals.concat(queryDeals);
    }

    return deals;
}

async function try_getRequests(
    _timeLow: number, 
    _timeHigh: number, 
    token: string,
    url: string,
    retries: number = 0
) {
    let offers: any;
    try {
        offers = await getRequests(_timeLow, _timeHigh, token, url);
        return offers;
    } catch (error) {
        if (retries < 10) {
            retries++;
            console.log("-- REINTENTO DE QUERY: " + retries);  
            offers = await try_getRequests(_timeLow, _timeHigh, token, url, retries + 1);
            console.log("-- REINTENTO EXITOSO --");
            return offers;
        } else {
            console.error(error);
            throw new Error(error);
        }
    }
}

async function getRequests(
    _timeLow: number, 
    _timeHigh: number, 
    _tokensAddress: string,
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ offers (where: {buyToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
    let queryService = new Query('p2p', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryOffers = response.offers;
    let offers = queryOffers;

    while(queryOffers.length >= 1000) {
        skip = offers.length;
        query = '{ offers (where: {buyToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryOffers = response.offers;
        offers = offers.concat(queryOffers);
    }

    return offers;
}

async function try_getOffersPrimary(
    _timeLow: number, 
    _timeHigh: number, 
    token: string,
    url: string,
    retries: number = 0
) {
    let offers: any;
    try {
        offers = await getOffersPrimary(_timeLow, _timeHigh, token, url);
        return offers;
    } catch (error) {
        if (retries < 10) {
            retries++;
            console.log("-- REINTENTO DE QUERY: " + retries);  
            offers = await try_getOffersPrimary(_timeLow, _timeHigh, token, url, retries + 1);
            console.log("-- REINTENTO EXITOSO --");
            return offers;
        } else {
            console.error(error);
            throw new Error(error);
        }
    }
}

async function getOffersPrimary(
    _timeLow: number, 
    _timeHigh: number, 
    _tokensAddress: string,
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ offers (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
    let queryService = new Query('p2p-primary', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryOffers = response.offers;
    let offers = queryOffers;

    while(queryOffers.length >= 1000) {
        skip = offers.length;
        query = '{ offers (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryOffers = response.offers;
        offers = offers.concat(queryOffers);
    }

    return offers;
}

async function getAllDealsPrimary(
    _timeLow: number, 
    _timeHigh: number, 
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ deals (where: {timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +', isSuccess:true}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } }';
    let queryService = new Query('p2p-primary', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryOffers = response.deals;
    let offers = queryOffers;

    while(queryOffers.length >= 1000) {
        skip = offers.length;
        query = '{ deals (where: {timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +', isSuccess:true}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryOffers = response.deals;
        offers = offers.concat(queryOffers);
    }

    return offers;
}

async function try_getRequestsPrimary(
    _timeLow: number, 
    _timeHigh: number, 
    token: string,
    url: string,
    retries: number = 0
) {
    let offers: any;
    try {
        offers = await getRequestsPrimary(_timeLow, _timeHigh, token, url);
        return offers;
    } catch (error) {
        if (retries < 10) {
            retries++;
            console.log("-- REINTENTO DE QUERY: " + retries);  
            offers = await try_getRequestsPrimary(_timeLow, _timeHigh, token, url, retries + 1);
            console.log("-- REINTENTO EXITOSO --");
            return offers;
        } else {
            console.error(error);
            throw new Error(error);
        }
    }
}

async function getRequestsPrimary(
    _timeLow: number, 
    _timeHigh: number, 
    _tokensAddress: string,
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ offers (where: {buyToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
    let queryService = new Query('p2p-primary', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryOffers = response.offers;
    let offers = queryOffers;

    while(queryOffers.length >= 1000) {
        skip = offers.length;
        query = '{ offers (where: {buyToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryOffers = response.offers;
        offers = offers.concat(queryOffers);
    }

    return offers;
}

async function try_getCollectableOffers(
    _timeLow: number, 
    _timeHigh: number, 
    token: string,
    url: string,
    retries: number = 0
) {
    let offers: any;
    try {
        offers = await getCollectableOffers(_timeLow, _timeHigh, token, url);
        return offers;
    } catch (error) {
        if (retries < 10) {
            retries++;
            console.log("-- REINTENTO DE QUERY: " + retries);  
            offers = await try_getCollectableOffers(_timeLow, _timeHigh, token, url, retries + 1);
            console.log("-- REINTENTO EXITOSO --");
            return offers;
        } else {
            console.error(error);
            throw new Error(error);
        }
    }
}

async function getCollectableOffers(
    _timeLow: number, 
    _timeHigh: number, 
    _tokensAddress: string,
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ offerCommodities (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp sellId { tokenId metadata reference} } seller { id name } buyer { id name } buyAmount timestamp } } }';
    let queryService = new Query('p2p', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryOffers = response.offerPackables;
    let offers = queryOffers;

    while(queryOffers.length >= 1000) {
        skip = offers.length;
        query = '{ offerCommodities (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp sellId { tokenId metadata reference} } seller { id name } buyer { id name } buyAmount timestamp } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryOffers = response.offerPackables;
        offers = offers.concat(queryOffers);
    }

    return offers;
}

async function try_getCollectableOffersPrimary(
    _timeLow: number, 
    _timeHigh: number, 
    token: string,
    url: string,
    retries: number = 0
) {
    let offers: any;
    try {
        offers = await getCollectableOffersPrimary(_timeLow, _timeHigh, token, url);
        return offers;
    } catch (error) {
        if (retries < 10) {
            retries++;
            console.log("-- REINTENTO DE QUERY: " + retries);  
            offers = await try_getCollectableOffersPrimary(_timeLow, _timeHigh, token, url, retries + 1);
            console.log("-- REINTENTO EXITOSO --");
            return offers;
        } else {
            console.error(error);
            throw new Error(error);
        }
    }
}

async function getCollectableOffersPrimary(
    _timeLow: number, 
    _timeHigh: number, 
    _tokensAddress: string,
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ offerCommodities (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp sellId { tokenId metadata reference} } seller { id name } buyer { id name } buyAmount timestamp } } }';
    let queryService = new Query('p2p-primary', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryOffers = response.offerPackables;
    let offers = queryOffers;

    while(queryOffers.length >= 1000) {
        skip = offers.length;
        query = '{ offerCommodities (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp sellId { tokenId metadata reference} } seller { id name } buyer { id name } buyAmount timestamp } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryOffers = response.offerPackables;
        offers = offers.concat(queryOffers);
    }

    return offers;
}

async function try_getPackableOffers(
    _timeLow: number, 
    _timeHigh: number, 
    token: string,
    url: string,
    retries: number = 0
) {
    let offers: any;
    try {
        offers = await getPackableOffers(_timeLow, _timeHigh, token, url);
        return offers;
    } catch (error) {
        if (retries < 10) {
            retries++;
            console.log("-- REINTENTO DE QUERY: " + retries);  
            offers = await try_getPackableOffers(_timeLow, _timeHigh, token, url, retries + 1);
            console.log("-- REINTENTO EXITOSO --");
            return offers;
        } else {
            console.error(error);
            throw new Error(error);
        }
    }
}

async function getPackableOffers(
    _timeLow: number, 
    _timeHigh: number, 
    _tokensAddress: string,
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ offerPackables (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
    let queryService = new Query('p2p', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryOffers = response.offerPackables;
    let offers = queryOffers;

    while(queryOffers.length >= 1000) {
        skip = offers.length;
        query = '{ offerPackables (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryOffers = response.offerPackables;
        offers = offers.concat(queryOffers);
    }

    return offers;
}

async function getAllPackableDeals(
    _timeLow: number, 
    _timeHigh: number, 
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ dealPackables (where: {timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +', isSuccess:true}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } }';
    let queryService = new Query('p2p', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryOffers = response.dealPackables;
    let offers = queryOffers;

    while(queryOffers.length >= 1000) {
        skip = offers.length;
        query = '{ dealPackables (where: {timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +', isSuccess:true}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryOffers = response.dealPackables;
        offers = offers.concat(queryOffers);
    }

    return offers;
}

async function try_getPackableRequests(
    _timeLow: number, 
    _timeHigh: number, 
    token: string,
    url: string,
    retries: number = 0
) {
    let offers: any;
    try {
        offers = await getPackableRequests(_timeLow, _timeHigh, token, url);
        return offers;
    } catch (error) {
        if (retries < 10) {
            retries++;
            console.log("-- REINTENTO DE QUERY: " + retries);  
            offers = await try_getPackableRequests(_timeLow, _timeHigh, token, url, retries + 1);
            console.log("-- REINTENTO EXITOSO --");
            return offers;
        } else {
            console.error(error);
            throw new Error(error);
        }
    }
}

async function getPackableRequests(
    _timeLow: number, 
    _timeHigh: number, 
    _tokensAddress: string,
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ offerPackables (where: {buyToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
    let queryService = new Query('p2p', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryOffers = response.offerPackables;
    let offers = queryOffers;

    while(queryOffers.length >= 1000) {
        skip = offers.length;
        query = '{ offerPackables (where: {buyToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryOffers = response.offerPackables;
        offers = offers.concat(queryOffers);
    }

    return offers;
}

async function try_getPackableOffersPrimary(
    _timeLow: number, 
    _timeHigh: number, 
    token: string,
    url: string,
    retries: number = 0
) {
    let offers: any;
    try {
        offers = await getPackableOffersPrimary(_timeLow, _timeHigh, token, url);
        return offers;
    } catch (error) {
        if (retries < 10) {
            retries++;
            console.log("-- REINTENTO DE QUERY: " + retries);  
            offers = await try_getPackableOffersPrimary(_timeLow, _timeHigh, token, url, retries + 1);
            console.log("-- REINTENTO EXITOSO --");
            return offers;
        } else {
            console.error(error);
            throw new Error(error);
        }
    }
}

async function getPackableOffersPrimary(
    _timeLow: number, 
    _timeHigh: number, 
    _tokensAddress: string,
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ offerPackables (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
    let queryService = new Query('p2p-primary', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryOffers = response.offerPackables;
    let offers = queryOffers;

    while(queryOffers.length >= 1000) {
        skip = offers.length;
        query = '{ offerPackables (where: {sellToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryOffers = response.offerPackables;
        offers = offers.concat(queryOffers);
    }

    return offers;
}

async function getAllPackableDealPrimary(
    _timeLow: number, 
    _timeHigh: number, 
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ dealPackables (where: {timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +', isSuccess:true}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } }';
    let queryService = new Query('p2p-primary', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryOffers = response.dealPackables;
    let offers = queryOffers;

    while(queryOffers.length >= 1000) {
        skip = offers.length;
        query = '{ dealPackables (where: {timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +', isSuccess:true}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryOffers = response.dealPackables;
        offers = offers.concat(queryOffers);
    }

    return offers;
}

async function try_getPackableRequestsPrimary(
    _timeLow: number, 
    _timeHigh: number, 
    token: string,
    url: string,
    retries: number = 0
) {
    let offers: any;
    try {
        offers = await getPackableRequestsPrimary(_timeLow, _timeHigh, token, url);
        return offers;
    } catch (error) {
        if (retries < 10) {
            retries++;
            console.log("-- REINTENTO DE QUERY: " + retries);  
            offers = await try_getPackableRequestsPrimary(_timeLow, _timeHigh, token, url, retries + 1);
            console.log("-- REINTENTO EXITOSO --");
            return offers;
        } else {
            console.error(error);
            throw new Error(error);
        }
    }
}

async function getPackableRequestsPrimary(
    _timeLow: number, 
    _timeHigh: number, 
    _tokensAddress: string,
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ offerPackables (where: {buyToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
    let queryService = new Query('p2p-primary', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryOffers = response.offerPackables;
    let offers = queryOffers;

    while(queryOffers.length >= 1000) {
        skip = offers.length;
        query = '{ offerPackables (where: {buyToken: "' + _tokensAddress + '", timestamp_gt: ' + _timeLow + ', timestamp_lt: ' + _timeHigh +'}, orderBy: timestamp, orderDirection:desc, first: 1000, skip: ' + skip + ') { timestamp deals(where:{isSuccess:true}) { offer { buyToken { tokenSymbol id } sellToken { tokenSymbol id } timestamp } seller { id name } buyer { id name } sellAmount buyAmount timestamp } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryOffers = response.offerPackables;
        offers = offers.concat(queryOffers);
    }

    return offers;
}

async function getUserBalances(
    _nickname: string,
    _blockNumber: number,
    _url: string = 'mainnet'
) {
    let query = '{ name(id:"' + _nickname + '", block:{number: ' + _blockNumber + '}) { wallet { balances (where:{balance_gt:0 token_not_in:["0xed1bed970ab6798a38e93c2a025806b0304e4099", "0xe9889ef80eca8d8769c6dea852b599821336c359", "0xe3f8af7dc825cc072bf50f1ef12fbc8a8133709b" "0xd9a7f80cd3552e30b62168164bd04c3b8e5dfcc0", "0xd3ef3182d53add05ae74ef74d19a0c29beef99ab", "0xbe7a8d8c2a26a847bbde18a401066f196bf5657d", "0x89e4cabb8c5cdf6e49092c4cad4fa3af4c329914", "0x88a83a48bf4039023118ac760e6beaf5e6f110fb", "0x77f4ab4a154cf41c0b812f0873a3491dd39f478a", "0x7777079bc93ece8a66424aa6bbed0546ec20d06e", "0x6e5040f4ba7a6ec228a5247fe690d5df73539b83", "0x6e0c484e9efccf8d29ef229cc5b47b8b79ed8f97", "0x6645223d7947b4534f09dee35796e1c23326fc5b", "0x314c70a406f9b23b78924942508ddc93357fa6f2", "0x2b072f4f8c4c702330919e4fc3b0f9c279ea9f0c", "0x0de6a7d5d6c00ed86b57779193e91151fc5b3aa1", "0x09ca4aacd1cd443f6b4bf1b1003973e169b1a934", "0x0978c06f95711faa469f180bfc8aea5ec768b784", "0x079b9d78e64d8194d9a0f364e9fa73f6886ebfa9"]}) { token { id tokenSymbol tokenKind } balance packables { id balances (where:{balance_gt:0}) { balance packableId { metadata } } } } } } }';
    let queryService = new Query('bank', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();

    if (response == undefined) return [];

    return response.name.wallet.balances;
}

async function getUserLastTxBeforeTime(
    _nickname: string,
    _timestamp: number,
    _url: string = 'mainnet'
) {
    let query = '{ name(id:"' + _nickname + '") { wallet { transactions (where:{timestamp_lt: ' + _timestamp + '} orderBy:timestamp, orderDirection:desc, first:1) { id } } } }';
    let queryService = new Query('bank', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();

    if (response == undefined) return null;

    return response.name.wallet.transactions[0].id;
}

async function try_getDexDeals(
    _timeLow: number,
    _timeHigh: number,
    _instrument: string[],
    _dex: "dex" | "dex-bicentenario",
    _url: string = 'mainnet',
    retries: number = 0
) {
    let deals: any;
    try {
        deals = await getDexDeals(_timeLow, _timeHigh, _instrument, _dex, _url);

        return deals;
    } catch (error) {
        if (retries < 10) {
            retries++;
            console.log("-- REINTENTO DE QUERY: " + retries);  
            deals = await try_getDexDeals(_timeLow, _timeHigh, _instrument, _dex, _url, retries + 1);
            console.log("-- REINTENTO EXITOSO --");
            return deals;
        } else {
            console.error(error);
            throw new Error(error);
        }
    }
}

async function getDexDeals(
    _timeLow: number,
    _timeHigh: number,
    _instrument: string[],
    _dex: "dex" | "dex-bicentenario",
    _url: string = 'mainnet'
) {
    let skip = 0;
    let stringArray = _instrument.join('", "');
    let query = '{ deals (first: 1000, skip: ' + skip + ', where:{tokenA_in:["' + stringArray + '"], tokenB_in:["' + stringArray + '"], timestamp_gte:' + _timeLow + ', timestamp_lte:' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc) { tokenA { id tokenSymbol } tokenB { id tokenSymbol } orderA { owner { id name } } orderB { owner { id name } } amountA amountB price side timestamp } }';
    let queryService = new Query(_dex, _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryDeals = response.deals;
    let deals = queryDeals;

    while(queryDeals.length >= 1000) {
        skip = deals.length;
        query = '{ deals (first: 1000, skip: ' + skip + ', where:{tokenA_in:["' + stringArray + '"], tokenB_in:["' + stringArray + '"], timestamp_gte:' + _timeLow + ', timestamp_lte:' + _timeHigh + '}, orderBy: timestamp, orderDirection:desc) { tokenA { id tokenSymbol } tokenB { id tokenSymbol } orderA { owner { id name } } orderB { owner { id name } } amountA amountB price side timestamp } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryDeals = response.deals;
        deals = deals.concat(queryDeals);
    }

    return deals;
}

async function getDexDealsByWallet(
    _timeLow: number,
    _timeHigh: number,
    _wallet: string,
    _dex: "dex" | "dex-bicentenario",
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ user(id:"'+ String(_wallet).toLowerCase() +'") { deals (first:1000, skip:' + skip + ', orderBy: timestamp, orderDirection:desc) { timestamp orderA { owner { id name } } orderB { owner { id name } } tokenA { id tokenSymbol } tokenB { id tokenSymbol } amountA amountB price side } } }';
    let queryService = new Query(_dex, _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryDeals = response.user.deals;
    let deals = queryDeals;

    while(queryDeals.length >= 1000) {
        skip = deals.length;
        query = '{ user(id:"'+ String(_wallet).toLowerCase() +'") { deals (first:1000, skip:' + skip + ', orderBy: timestamp, orderDirection:desc) { timestamp orderA { owner { id name } } orderB { owner { id name } } tokenA { id tokenSymbol } tokenB { id tokenSymbol } amountA amountB price side } } }';
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryDeals = response.user.deals;
        deals = deals.concat(queryDeals);
    }

    return deals;
}

async function getPiPrice(
    _timeLow: number, 
    _timeHigh: number, 
    _url: string = 'mainnet'
) {
    let skip = 0;
    let query = '{ prices (where: {timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '} orderBy: timestamp, orderDirection:asc, first: 1000, skip: ' + skip + ') { id supply collateral piPrice collateralPrice timestamp } }'
    let queryService = new Query('piprice', _url);
    queryService.setCustomQuery(query);
    let response = await queryService.request();
    let queryPrices = [];
    if (response.prices != undefined) {
        queryPrices = response.prices;
    } 
    
    let prices = queryPrices;

    while(queryPrices.length >= 1000) {
        skip = prices.length;
        let query = '{ prices (where: {timestamp_gte: ' + _timeLow + ', timestamp_lt: ' + _timeHigh + '} orderBy: timestamp, orderDirection:asc, first: 1000, skip: ' + skip + ') { id supply collateral piPrice collateralPrice timestamp } }'
        queryService.setCustomQuery(query);
        response = await queryService.request();
        queryPrices = response.offerPackables;
        prices = prices.concat(queryPrices);
    }

    return prices;
}

function addTable(
    sheet: any,
    tableName: string,
    tablePosition: string,
    columns: any[],
    rows: any[]
) {
    sheet.addTable({
        name: tableName,
        ref: tablePosition,
        headerRow: true,
        totalsRow: true,
        style: {
            theme: 'TableStyleMedium1',
            showRowStripes: true,
        },
        columns: columns,
        rows: rows,
    });
}

function getTime() {
    return timeConverter(Date.now() / 1000);
}

function getUtcTime() {
    return Date.now() / 1000;
}

function getUtcTimeFromDate(year: number, month: number, day: number) {
    let timeDate = new Date(year, month - 1, day);
    let utcTime = timeDate.getTime() / 1000;
    return utcTime
}

function timeConverter(UNIX_timestamp: number) {
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
    let rows: any[] = [];
    let array: any[] = [];

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
    let rows: any[] = [];
    let array: any[] = [];

    array.push(new Date());
    array.push("");
    array.push("");
    array.push("");
    array.push(0);

    rows.push(array);

    return rows;
}

function getEndPointDates(UNIX_timestamp: number) {
    var a = new Date(UNIX_timestamp * 1000);
    var year = a.getFullYear();
    var month = a.getMonth() + 1;
    var date = a.getDate();

    let dayAfter = +UNIX_timestamp + +ONE_UTC_DAY;
    var b = new Date(dayAfter * 1000);
    var toYear = b.getFullYear();
    var toMonth = b.getMonth() + 1;
    var toDate = b.getDate();

    var from = year + '-' + month + '-' + date;
    var to = toYear + '-' + toMonth + '-' + toDate;
    return [from, to];
}

function cleanEmptyDeals(array: any[]) {
    let cleanArray: any[] = [];

    for (let i = 0; i < array.length; i++) {
        if (array[i].deals.length > 0) {
            cleanArray.push(array[i]);
        }
    }

    return cleanArray;
}

async function getDayRate(
    fromYear: number,
    fromMonth: number,
    toYear: number,
    toMonth: number,
    token: string,
    tokenCategory: number
) {
    if ((fromYear == 2020) && (fromMonth < 11)) {
        return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    } else {
        if (
            (tokenCategory == 1) &&
            (token != Constants.PI.address) &&
            (token != Constants.USD.address) &&
            (token != Constants.USC.address) &&
            (token != Constants.PEL.address)
        ) {
    
            let from = fromYear + "-" + fromMonth + "-01";
            let to = toYear + "-" + toMonth + "-01";
    
            let responseData: any;
    
            try {
                responseData = await requestRateEndPoint(from, to, token);
    
                let rates = [];
                let factor = 1;
    
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
    
                for (let i = 23; i < responseData.length; i=i+24) {
                    if (
                        (token == Constants.BTC.address) ||
                        (token == Constants.ETH.address) ||
                        (token == Constants.USDT.address)
                    ) {
                        rates.push(responseData[i].rate/factor);
                    } else {
                        if (responseData[i].rate == 0) {
                            rates.push(0);
                        } else {
                            rates.push((1/(responseData[i].rate))/factor);
                        }
                    }
                }
    
                let len = 31 - rates.length;
    
                if (len > 0) {
                    for (let j = 0; j < len; j++) {
                        rates.push(0);
                    }
                }
    
                return rates;
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }
        } else if (
            (token == Constants.USD.address) ||
            (token == Constants.USC.address) ||
            (token == Constants.PEL.address)
        ) {
            return [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        } else if (token == Constants.PI.address) {
            let dates = convertMonthAndYearToUTC(fromYear, fromMonth, toYear, toMonth);
            let rates = [];
    
            try {
                let responseData = await getPiPrice(dates[0], dates[1], 'mainnet');
    
                for (let i = 22; i < responseData.length; i=i+24) {
                    rates.push(responseData[i].piPrice);
                }
    
                let len = 31 - rates.length;
    
                if (len > 0) {
                    for (let j = 0; j < len; j++) {
                        rates.push(0);
                    }
                }
    
                let rates2 = await getDayRate(fromYear, fromMonth, toYear, toMonth, Constants.BTC.address, Constants.BTC.category);
    
                let rates3 = [];
    
                for (let j = 0; j < rates.length; j++) {
                    rates3.push(rates[j] * rates2[j]);
                }
    
                return rates3;
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }
        } else {
            let from = fromYear + "-" + fromMonth + "-01";
            let to = toYear + "-" + toMonth + "-01";

            try {
                let response = await requestDataLake(token, from, to);

                let rates = [];
                for (let i = 0; i < response.length; i++) {
                    rates.push(response[i].close);
                }

                let len = rates.length;

                if (len < 31) {
                    for (let j = 0; j < (31 - len); j ++) {
                        rates.push(0);
                    }
                } else if (len > 31) {
                    rates.length = 31;
                }

                return rates;
            } catch (e) {
                return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            }
        }
    }
}

function convertMonthAndYearToUTC(
    fromYear: number,
    fromMonth: number,
    toYear: number,
    toMonth: number
) {
    let fromDate = new Date();
    fromDate.setFullYear(fromYear);
    fromDate.setMonth(fromMonth - 1);
    fromDate.setDate(1);
    fromDate.setHours(0);
    fromDate.setMinutes(0);
    fromDate.setSeconds(0);
    fromDate.setMilliseconds(0);
    let toDate = new Date();
    toDate.setFullYear(toYear);
    toDate.setMonth(toMonth - 1);
    toDate.setDate(1);
    toDate.setHours(0);
    toDate.setMinutes(0);
    toDate.setSeconds(0);
    toDate.setMilliseconds(0);

    return [Math.floor(fromDate.getTime()/1000), Math.floor(toDate.getTime()/1000)];
}

async function convertToUsd(
    amount: number,
    token: string,
    timestamp: number
) {
    let endPointDates = getEndPointDates(timestamp);
    let from = endPointDates[0];
    let to = endPointDates[1];
    
    if (token == Constants.PI.address) {
        let rates = await getPiPrice(timestamp, (+timestamp + +ONE_UTC_DAY), 'mainnet');

        if (rates.length == 0) {
            return 0;
        } else {
            let rate = rates[rates.length - 1].piPrice;

            let rates2 = await requestRateEndPoint(from, to, Constants.BTC.address);

            if (rates2.length == 0) {
                return 0;
            } else {
                let rate2 = rates2[rates2.length - 1].rate;

                return amount * rate * rate2;
            }
        }
        return 0;
    } else if (
        (token == Constants.USD.address) ||
        (token == Constants.USC.address) ||
        (token == Constants.PEL.address)
    ) {
        return amount;
    } else {
        let rates = await requestRateEndPoint(from, to, token);

        if (rates.length == 0) {
            rates = await requestDataLake(token, from, to);
            if (rates == undefined) return 0;
            let rate = rates[rates.length - 1].open;
            return amount*rate;
        } else {
            let rate = rates[rates.length - 1].rate;

            let factor = 1;

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

            if (
                (token == Constants.BTC.address) ||
                (token == Constants.ETH.address) ||
                (token == Constants.USDT.address)
            ) {
                rate = 1 / rate;
            }

            return amount/(rate * factor);
        }
    }
}

async function convertToUsdFromObj(
    amount: number,
    token: string,
    tokenKind: number,
    timestamp: number,
    ratesObj: any
) {
    let day = new Date(timestamp * 1000).getDate();
    
    if (ratesObj[token] == undefined) {
        let date = new Date(timestamp * 1000);
        let fromMonth = date.getMonth() + 1;
        let fromYear = date.getFullYear()
        let toMonth = 0;
        let toYear = fromYear;
        if (fromMonth == 12) {
            toMonth = 1;
            fromYear++;
        } else {
            toMonth = fromMonth + 1;
        }

        ratesObj[token] = await getDayRate(fromYear, fromMonth, toYear, toMonth, token, tokenKind);
    }

    let rate = ratesObj[token][day];
    if ((rate == undefined) || (rate == 0)) return 0;

    return amount*rate;
}

async function requestDataLake(
    token: string,
    from: string,
    to: string
) {
    let parId = Constants.INSTRUMENT_IDS[token];
    if (parId == undefined) return [{"open": 0,"close":0,"volume":0}];

    let endPoint = "https://api.pimarkets.io/v1/instrument/tickers/" + parId;
    let body = JSON.stringify({"interval":"1day","start_date":from,"end_date":to,"empty_candles":true});

    let response: any;
    let responseData: any;

    try {
        response = await fetch(endPoint, {
            "method": 'POST',
            "headers": {
                "Accept": 'application/json',
                'Content-Type': 'application/json',
            },
            "body": body,
            "redirect": 'follow'
        });

        if (response.ok) {
            responseData = await response.json();
        }

        return responseData;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

async function requestRateEndPoint(
    from: string,
    to: string,
    token: string,
    retries: number = 0
) {
    try {
        return await try_requestRateEndPoint(from, to, token);
    } catch (e) {
        if (retries < 5) {
            console.log("-----REINTENTO: " + retries)
            return await requestRateEndPoint(from, to, token, retries + 1);
        } else {
            console.error(e);
            throw new Error(e);
        }
    }
}

async function try_requestRateEndPoint(
    from: string,
    to: string,
    token: string
) {
    let endPoint = "https://api.pimarkets.io/v1/public/asset/exchange/rates/history";
    let body = JSON.stringify({"from":from,"to":to,"asset_id":token});

    let response: any;
    let responseData: any;

    try {
        response = await fetch(endPoint, {
            "method": 'POST',
            "headers": {
                "Accept": 'application/json',
                'Content-Type': 'application/json',
            },
            "body": body,
            "redirect": 'follow'
        });

        if (response.ok) {
            responseData = await response.json();
        }

        return responseData;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

async function getUsersDataProtected(
    walletsArray: string[],
    bearerToken: string,
    includeBanks: boolean = false
) {
    let endPoint = "https://api.pimarkets.io/v1/user/office/users-data";
    let body = JSON.stringify({"wallets":walletsArray,"include_banks":includeBanks});

    let response: any;
    let responseData: any;

    try {
        response = await fetch(endPoint, {
            "method": 'POST',
            "headers": {
                "Accept": 'application/json',
                'Content-Type': 'application/json',
                "Authorization": 'Bearer ' + bearerToken
            },
            "body": body,
            "redirect": 'follow'
        });

        if (response.ok) {
            responseData = await response.json();
        }

        return responseData;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

export class DealsReportData {

    readonly tokenSymbol: string;
    readonly tokenAddress: string;
    readonly offers: any[];
    readonly requests: any[];

    constructor(
        tokenAddress: string,
        tokenSymbol: string,
        offers: any[],
        requests: any[]
    ) {
        this.tokenAddress = tokenAddress;
        this.tokenSymbol = tokenSymbol;
        this.offers = offers;
        this.requests = requests;
    }
}

export class HoldersReportData {

    readonly tokenSymbol: string;
    readonly tokenAddress: string;
    readonly holders: any[];
    readonly offers: any[];
    readonly expiry: string[];
    readonly timestamp: string;

    constructor(
        tokenAddress: string,
        tokenSymbol: string,
        holders: any[],
        offers: any[],
        expiry?: string[]
    ) {
        this.tokenAddress = tokenAddress;
        this.tokenSymbol = tokenSymbol;
        this.holders = holders;
        this.offers = offers;
        this.timestamp = getTime();
        
        if (expiry != undefined) {
            this.expiry = expiry;
        }
    }
}