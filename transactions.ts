import { ethers } from 'ethers';
import * as Constants from './constants';
import fetch from 'node-fetch';

export class Transactions {

    async getReceipt(_response: any) {
        try {
            let _receipt = await _response.wait();
            return _receipt;
        } catch(error) {

            let _requireMsg = await this.getRequireErrorMsg(_response.hash);
            let _errorObj = new ErrorObj(
                _requireMsg,
                _response.hash,
                error 
            )

            throw new Error(JSON.stringify(_errorObj));
        }
    }

    async sendTransaction(_wallet: ethers.Wallet, _transaction: ethers.utils.Transaction) {

        if (!_wallet.provider) {
            throw new Error('Missing provider in wallet');
        } else {
            let _populatedTransaction = await this.createTransaction(_wallet, _transaction);
            let _signedTransaction = await this.signTransaction(_wallet, _populatedTransaction);
            let _response;

            try {
                _response = await this.sendSignedTransaction(_signedTransaction, _wallet.provider);
            } catch (error) {
                console.error(error);
                throw new Error(error);
            }

            try {
                let _receipt = await _response.wait();
                return _receipt;
            } catch(error) {
                console.error(error);
                throw new Error(_response);
            }
        }
    }
    
    async createTransaction(_wallet: ethers.Wallet, _transaction: ethers.utils.Transaction) { 
        let _populatedTransaction = await ethers.utils.populateTransaction(
            _transaction, 
            _wallet.provider, 
            _wallet.address
        );
    
        if (_populatedTransaction.gasPrice.lt(ethers.utils.bigNumberify(Constants.MIN_GAS_PRICE))) {
            _populatedTransaction.gasPrice = ethers.utils.bigNumberify(Constants.MIN_GAS_PRICE);
        }
    
        return _populatedTransaction;
    }
    
    async signTransaction(_wallet: ethers.Wallet, _transaction: ethers.utils.Transaction) {
        return await _wallet.sign(_transaction);
    }
    
    async sendSignedTransaction(_signedTransaction: any, _provider: ethers.providers.Provider) {
        return await _provider.sendTransaction(_signedTransaction);
    }

    async getRequireErrorMsg(_txHash: string) {
        try {
            let trace = await this.getTraces(_txHash)
            let requireCode = this.decodeTrace(trace);
            let requireMsg = this.getMessage(requireCode);
            return requireMsg;
        } catch(error) {
            console.error(error);
            return "No se puede decodificar el error";
        }
    }

    async getTraces(_txHash: string) {
        let response: any;
        let query = '{"method":"trace_replayTransaction","params":["' + _txHash + '",["trace"]],"id":1,"jsonrpc":"2.0"}';
    
        try {
            response = await fetch(Constants.TRACES_URL, {
                "method": 'POST',
                "headers": {
                    "Accept": 'application/json',
                    'Content-Type': 'application/json',
                },
                "body": query,
            });
        } catch (error) {
            console.error(error);
        }
    
        if (response != null) {
            if (response.ok) {
                let responseData = await response.json();
                return responseData.result.output;
            } else {
                return "0";
            }
        } else {
            return "0";
        }
    }
    
    decodeTrace(code: any): string {
        let codeString
        const fnSelectorByteLength = 4
        const dataOffsetByteLength = 32
        const strLengthByteLength = 32
        const strLengthStartPos = 2 + ((fnSelectorByteLength + dataOffsetByteLength) * 2)
        const strDataStartPos = 2 + ((fnSelectorByteLength + dataOffsetByteLength + strLengthByteLength) * 2)
    
        const strLengthHex = code.slice(strLengthStartPos).slice(0, strLengthByteLength * 2)
        const strLengthInt = parseInt(`0x${strLengthHex}`, 16)
        const strDataEndPos = strDataStartPos + (strLengthInt * 2)
    
        if (codeString === '0x') return ''
        codeString = `0x${code.slice(strDataStartPos, strDataEndPos)}`
    
        // If the codeString is an odd number of characters, add a trailing 0
        if (codeString.length % 2 === 1) {
            codeString += '0'
        }
    
        return ethers.utils.toUtf8String(codeString);
    }
    
    getMessage(error: string): string {
        let errorMessage;
        switch (error) {
            case '001':
                errorMessage = "[001] You are not switcher";
                break;
            case '002':
                errorMessage = "[002] Not official token";
                break;
            case '003':
                errorMessage = "[003] Controller is OFF";
                break;
            case '004':
                errorMessage = "[004] You are not owner";
                break;
            case '005':
                errorMessage = "[005] You are not diamondOwner";
                break;
            case '006':
                errorMessage = "[006] Diamond not upgradable";
                break;
            case '007':
                errorMessage = "[007] Diamond not cuttable";
                break;
            case '008':
                errorMessage = "[008] IdentityFactory is OFF";
                break;
            case '009':
                errorMessage = "[009] You are not Backend";
                break;
            case '010':
                errorMessage = "[010] You are not switcher";
                break;
            case '011':
                errorMessage = "[011] You are not IdentityFactory";
                break;
            case '012':
                errorMessage = "[012] Registry is OFF";
                break;
            case '013':
                errorMessage = "[013] You are not controllerOwner";
                break;
            case '014':
                errorMessage = "[014] You are not controllerOwner";
                break;
            case '015':
                errorMessage = "[015] You are not switcher";
                break;
            case '016':
                errorMessage = "[016] You are not IdentityFactory";
                break;
            case '017':
                errorMessage = "[017] Hash is not available";
                break;
            case '018':
                errorMessage = "[018] Hash already setted for that identity";
                break;
            case '019':
                errorMessage = "[019] You are not backend";
                break;
            case '020':
                errorMessage = "[020] Identity with hash not setted";
                break;
            case '021':
                errorMessage = "[021] Identity with hashDD already setted";
                break;
            case '022':
                errorMessage = "[022] HashDD already setted for that identity";
                break;
            case '023':
                errorMessage = "[023] You are not controllerOwner";
                break;
            case '024':
                errorMessage = "[024] You are not IdentityFactory";
                break;
            case '025':
                errorMessage = "[025] Name is not available";
                break;
            case '026':
                errorMessage = "[026] You are not nameOwner";
                break;
            case '027':
                errorMessage = "[027] You are not nameOwner";
                break;
            case '028':
                errorMessage = "[028] Address has a name";
                break;
            case '029':
                errorMessage = "[029] Cannot assign zero address to a name";
                break;
            case '030':
                errorMessage = "[030] Name owner cannot be zero address";
                break;
            case '031':
                errorMessage = "[031] El mercado está en estado inactivo";
                break;
            case '032':
                errorMessage = "[032] El emisor no es el controllerOwner";
                break;
            case '033':
                errorMessage = "[033] La dicc emisora no es la correcta";
                break;
            case '034':
                errorMessage = "[034] Llamada no realizada desde el switcher";
                break;
            case '035':
                errorMessage = "[035] Token no aceptado por este mercado";
                break;
            case '036':
                errorMessage = "[036] Fondos Pi del mercado insuficientes";
                break;
            case '037':
                errorMessage = "[037] Fondos Token del mercado insuficientes";
                break;
            case '038':
                errorMessage = "[038] Llamada no realizada desde el controllerOwner";
                break;
            case '039':
                errorMessage = "[039] Llamada no realizada desde el backend";
                break;
            case '040':
                errorMessage = "[040] El P2P está en estado inactivo";
                break;
            case '041':
                errorMessage = "[041] Llamada no realizada desde el switcher";
                break;
            case '042':
                errorMessage = "[042] El token enviado no es oficial";
                break;
            case '043':
                errorMessage = "[043] El token de contrapartida no es oficial";
                break;
            case '044':
                errorMessage = "[044] La cantidad a comprar supera lo ofertado";
                break;
            case '045':
                errorMessage = "[045] La cantidad a pactar es inferior al límite mínimo";
                break;
            case '046':
                errorMessage = "[046] La cantidad a pactar es superior al límite máximo";
                break;
            case '047':
                errorMessage = "[047] La reputación del comprador es inferior a la requerida";
                break;
            case '048':
                errorMessage = "[048] No puede tener más de un pacto fiat abierto";
                break;
            case '049':
                errorMessage = "[049] La cantidad a pactar debe ser igual a la ofertada (no acepta pactos parciales)";
                break;
            case '050':
                errorMessage = "[050] El voto debe ser acepto/no acepto";
                break;
            case '051':
                errorMessage = "[051] Sólo el ofertante/comprador pueden reclamar al auditor";
                break;
            case '052':
                errorMessage = "[052] No eres el auditor de este pacto";
                break;
            case '053':
                errorMessage = "[053] Sólo el dueño puede cancela la oferta";
                break;
            case '054':
                errorMessage = "[054] Sólo el dueño puede actualizar el precio de la oferta";
                break;
            case '055':
                errorMessage = "[055] Error desconocido";
                break;
            case '056':
                errorMessage = "[056] Token no oficial";
                break;
            case '057':
                errorMessage = "[057] No puedes pactar tu propia oferta";
                break;
            case '058':
                errorMessage = "[058] Cantidad de Pi distinta a la enviada en msg.value";
                break;
            case '059':
                errorMessage = "[059] Llamada no realizada desde el controllerOwner";
                break;
            case '060':
                errorMessage = "[060] El P2P está en estado inactivo";
                break;
            case '061':
                errorMessage = "[061] Llamada no realizada desde el switcher";
                break;
            case '062':
                errorMessage = "[062] El token demandado no es oficial";
                break;
            case '063':
                errorMessage = "[063] El token ofertado no es oficial";
                break;
            case '064':
                errorMessage = "[064] Sólo el dueño puede cancelar la oferta";
                break;
            case '065':
                errorMessage = "[065] Sólo el dueño puede actualizar el precio de la oferta";
                break;
            case '066':
                errorMessage = "[066] Token no oficial";
                break;
            case '067':
                errorMessage = "[067] Token no oficial";
                break;
            case '068':
                errorMessage = "[068] Cantidad de Pi distinta a la enviada en msg.value";
                break;
            case '069':
                errorMessage = "[069] Movimiento bloqueado por su configuración de estado";
                break;
            case '070':
                errorMessage = "[070] Movimiento bloqueado por su configuración de estado";
                break;
            case '071':
                errorMessage = "[071] La dirección de destino no es un contrato factoría";
                break;
            case '072':
                errorMessage = "[072] Sólo la dirección recovery puede modificar el estado";
                break;
            case '073':
                errorMessage = "[073] Llamada no realizada desde el owner de la Identidad";
                break;
            case '074':
                errorMessage = "[074] Llamada no realizada desde el recovery de la Identidad";
                break;
            case '075':
                errorMessage = "[075] Llamada no realizada desd el owner/recovery de la Identidad";
                break;
            case '076':
                errorMessage = "[076] Sólo el NameService puede modificar el nombre de usuario";
                break;
            case '077':
                errorMessage = "[077] Sólo el WalletFactory puede modificar el wallet de la Identidad";
                break;
            case '078':
                errorMessage = "[078] Esta dirección ya está registrada en la Identidad";
                break;
            case '079':
                errorMessage = "[079] Llamada no realizada desde el owner de la Wallet";
                break;
            case '080':
                errorMessage = "[080] Llamada no realizada desde el recovery de la Wallet";
                break;
            case '081':
                errorMessage = "[081] Llamada no realizada desde el owner/recovery de la Wallet";
                break;
            case '082':
                errorMessage = "[082] Movimiento bloqueado por su configuración de seguridad";
                break;
            case '083':
                errorMessage = "[083] Movimiento bloqueado por su configuración de seguridad";
                break;
            case '084':
                errorMessage = "[084] Movimiento bloqueado por su configuración de seguridad";
                break;
            case '085':
                errorMessage = "[085] Esta llamada sólo la puede realizar desde el wallet Recovery";
                break;
            case '086':
                errorMessage = "[086] Esta llamada sólo la puede realizar desde el wallet Recovery";
                break;
            case '087':
                errorMessage = "[087] No puede eliminar su Wallet con saldo";
                break;
            case '088':
                errorMessage = "[088] Token no autorizado";
                break;
            case '089':
                errorMessage = "[089] Token no autorizado";
                break;
            case '090':
                errorMessage = "[090] Token no autorizado";
                break;
            case '091':
                errorMessage = "[091] Movimiento bloqueado por su configuración de seguridad";
                break;
            case '092':
                errorMessage = "[092] Movimiento bloqueado por su configuración de seguridad";
                break;
            case '093':
                errorMessage = "[093] No está autorizado a ofertar este token en el mercado primario";
                break;
            case '094':
                errorMessage = "[094] Este par no está autorizado en el mercado primario";
                break;
            case '095':
                errorMessage = "[095] No está autorizado a ofertar este token en el mercado primario";
                break;
            case '096':
                errorMessage = "[096] Este par no está autorizado en el mercado primario";
                break;
            case '097':
                errorMessage = "[097] Esta oferta tiene un comprador preasignado";
                break;
            case '098':
                errorMessage = "[098] En el mercado primario no se acepta fiat";
                break;
            case '099':
                errorMessage = "[099] Llamada no realizada desde el controllerOwner";
                break;
            case '100':
                errorMessage = "[100] El P2P está en estado inactivo";
                break;
            case '101':
                errorMessage = "[101] Llamada no realizada desde el switcher";
                break;
            case '102':
                errorMessage = "[102] El token demandado no es oficial";
                break;
            case '103':
                errorMessage = "[103] El token ofertado no es oficial";
                break;
            case '104':
                errorMessage = "[104] La cantidad a comprar supera lo ofertado";
                break;
            case '105':
                errorMessage = "[105] El token ha superado su fecha de vencimiento";
                break;
            case '106':
                errorMessage = "[106] La cantidad a pactar es inferior al límite mínimo";
                break;
            case '107':
                errorMessage = "[107] La cantidad a pactar es superior al límite máximo";
                break;
            case '108':
                errorMessage = "[108] Debe pactar una cantidad entera, token indivisible";
                break;
            case '109':
                errorMessage = "[109] Sólo el dueño de la oferta la puede cancelar";
                break;
            case '110':
                errorMessage = "[110] Sólo el dueño de la oferta puede modificar el precio";
                break;
            case '111':
                errorMessage = "[111] Token no oficial";
                break;
            case '112':
                errorMessage = "[112] Token no oficial";
                break;
            case '113':
                errorMessage = "[113] Cantidad de Pi distinta a la enviada en msg.value";
                break;
            case '114':
                errorMessage = "[114] El token ha superado su fecha de vencimiento";
                break;
            case '115':
                errorMessage = "[115] No está autorizado a ofertar este token en el mercado primario";
                break;
            case '116':
                errorMessage = "[116] Este par no está autorizado en el mercado primario";
                break;
            case '117':
                errorMessage = "[117] Saldo insuficiente para la orden del DEX";
                break;
            case '118':
                errorMessage = "[118] Saldo autorizado insuficiente";
                break;
            case '119':
                errorMessage = "[119] No puede aprobar más saldo del que dispone";
                break;
            case '120':
                errorMessage = "[120] Sólo el Emisor puede usar la función charge";
                break;
            case '121':
                errorMessage = "[121] No se puede emitir a la ZeroAddress";
                break;
            case '122':
                errorMessage = "[122] Saldo insuficiente";
                break;
            case '123':
                errorMessage = "[123] Saldo autorizado insuficiente";
                break;
            case '124':
                errorMessage = "[124] Saldo insuficiente para operar";
                break;
            case '125':
                errorMessage = "[125] Error desconocido";
                break;
            case '126':
                errorMessage = "[126] Token inválido";
                break;
            case '127':
                errorMessage = "[127] Dirección cero inválida";
                break;
            case '128':
                errorMessage = "[128] Indice incorrecto";
                break;
            case '129':
                errorMessage = "[129] Saldo insuficiente";
                break;
            case '130':
                errorMessage = "[130] Destinatario inválido (dirección cero)";
                break;
            case '131':
                errorMessage = "[131] No se puede autorizar a sí mismo";
                break;
            case '132':
                errorMessage = "[132] Saldo insuficiente";
                break;
            case '133':
                errorMessage = "[133] Destinatario inválido (dirección cero)";
                break;
            case '134':
                errorMessage = "[134] El destinatario no acepta este tipo de token";
                break;
            case '135':
                errorMessage = "[135] Token indivisible, sólo puede transferir cantidades enteras";
                break;
            case '136':
                errorMessage = "[136] No se puede emitir a la dirección cero";
                break;
            case '137':
                errorMessage = "[137] Token indivisible, sólo puede transferir cantidades enteras";
                break;
            case '138':
                errorMessage = "[138] Token indivisible, sólo puede transferir cantidades enteras";
                break;
            case '139':
                errorMessage = "[139] Saldo insuficiente";
                break;
            case '140':
                errorMessage = "[140] El token ha superado su fecha de vencimiento";
                break;
            case '141':
                errorMessage = "[141] El token ha superado su fecha de vencimiento";
                break;
            case '142':
                errorMessage = "[142] Debe pactar una cantidad entera, token indivisible";
                break;
            case '143':
                errorMessage = "[143] Llamada no realizada desde el controllerOwner";
                break;
            case '144':
                errorMessage = "[144] Sólo SmartID completos pueden desplegar subastas";
                break;
            case '145':
                errorMessage = "[145] El token indicado para el pago de su subasta no es oficial";
                break;
            case '146':
                errorMessage = "[146] Llamada no realizada desde el auctionFactoryOwner";
                break;
            case '147':
                errorMessage = "[147] Llamada no realizada desde el auctionFactoryOwner";
                break;
            case '148':
                errorMessage = "[148] Llamada no realizada desde el auctionFactoryOwner";
                break;
            case '149':
                errorMessage = "[149] La subasta no está abierta";
                break;
            case '150':
                errorMessage = "[150] La subasta aún está abierta";
                break;
            case '151':
                errorMessage = "[151] Llamada no realizada desde el controllerOwner";
                break;
            case '152':
                errorMessage = "[152] El envío de PI sólo está permitido desde el auctionFactory";
                break;
            case '153':
                errorMessage = "[153] Llamada no realizada desde un SmartID completo";
                break;
            case '154':
                errorMessage = "[154] La nueva puja debe superar a la máxima actual";
                break;
            case '155':
                errorMessage = "[155] Debe disponer de una puja y depósito previo";
                break;
            case '156':
                errorMessage = "[156] La nueva puja debe superar a la máxima actual";
                break;
            case '157':
                errorMessage = "[157] No puede cancelar la puja cuando va ganando la subasta";
                break;
            case '158':
                errorMessage = "[158] No dispone de una puja previa que cancelar";
                break;
            case '159':
                errorMessage = "[159] Solamente el ganador de la subasta la puede liberar";
                break;
            case '160':
                errorMessage = "[160] Solamente el auditor puede cancelar un pacto de subasta";
                break;
            case '161':
                errorMessage = "[161] Solamente el dueño/auditor de la subasta la puede cancelar";
                break;
            case '162':
                errorMessage = "[162] No se pude cancelar la subasta una vez comienzan las pujas";
                break;
            case '163':
                errorMessage = "[163] No se pude cancelar la subasta una vez comienzan las pujas";
                break;
            case '164':
                errorMessage = "[164] La subasta no es destruible";
                break;
            case '165':
                errorMessage = "[165] La subasta no se puede destruir mientras tiene saldo";
                break;
            case '166':
                errorMessage = "[166] La subasta debe estar cerrada para fondearse";
                break;
            case '167':
                errorMessage = "[167] La subasta se debe fondear desde el auctionFactory";
                break;
            case '168':
                errorMessage = "[168] La subasta se debe fondear con el token subastado";
                break;
            case '169':
                errorMessage = "[169] La subasta sólo puede recibir el token correspondiente a las pujas";
                break;
            case '170':
                errorMessage = "[170] La fecha de finalización de la subasta debe ser futura";
                break;
            case '171':
                errorMessage = "[171] No puede pujar varias veces en una misma subasta";
                break;
            case '172':
                errorMessage = "[172] No se puede cargar un pago de un token no oficial";
                break;
            case '173':
                errorMessage = "[173] La tasa de cambio para el activo no está fijada";
                break;
            case '174':
                errorMessage = "[174] La tasa de cambio para el activo no está fijada";
                break;
            case '175':
                errorMessage = "[175] La tasa de cambio para el activo 1 no está fijada";
                break;
            case '176':
                errorMessage = "[176] La tasa de cambio para el activo 2 no está fijada";
                break;
            case '177':
                errorMessage = "[177] La tasa de cambio para el activo no está actualizada";
                break;
            case '178':
                errorMessage = "[178] El token ERC223 del par indicado no es oficial";
                break;
            case '179':
                errorMessage = "[179] Llamada no realizada desde el backend";
                break;
            case '180':
                errorMessage = "[180] No puede cancelar una orden si no es su propietario";
                break;
            case '181':
                errorMessage = "[181] La orden no está abierta y/o ya fue cancelada";
                break;
            case '182':
                errorMessage = "[182] Podrá cancelar su orden cuando pasen 12 bloques desde que se realizó";
                break;
            case '183':
                errorMessage = "[183] Alguna de las órdenes a pactar no está abierta";
                break;
            case '184':
                errorMessage = "[184] Alguna de las órdenes a pactar está cerrada";
                break;
            case '185':
                errorMessage = "[185] Los pares de las órdenes a pactar no coinciden";
                break;
            case '186':
                errorMessage = "[186] Los pares de las órdenes a pactar no coinciden";
                break;
            case '187':
                errorMessage = "[187] El precio de la orden A no es menor o igual al de la orden B";
                break;
            case '188':
                errorMessage = "[188] El precio de la orden A no es mayor o igual al de la orden B";
                break;
            case '189':
                errorMessage = "[189] Los vencimientos de las órdenes no coinciden";
                break;
            case '190':
                errorMessage = "[190] La orden ya existía anteriormente";
                break;
            case '191':
                errorMessage = "[191] No se puede transferir un token no oficial";
                break;
            case '192':
                errorMessage = "[192] No se puede realizar un cargo de un token packable no oficial";
                break;
            default:
                errorMessage = error;
        }
    
        return errorMessage;
    }
}

export class ErrorObj {
    readonly errorMessage: string;
    readonly transactionHash: string;
    readonly web3Error: any;

    constructor(
        errorMessage: string,
        transactionHash: string,
        web3Error: any
    ) {
        this.errorMessage = errorMessage;
        this.transactionHash = transactionHash;
        this.web3Error = web3Error;
    }
}