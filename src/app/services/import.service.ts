import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { MessageService } from './message.service';
import { BalanceService } from './balance.service';
import { Identity } from './../interfaces';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class ImportService {

  constructor(
    private walletService: WalletService,
    private messageService: MessageService,
    private balanceService: BalanceService,
    private http: HttpClient
  ) { }
  async importWalletData(json: string): Promise<boolean> {
    try {
      const walletData = JSON.parse(json);
      if (walletData.wallet !== 'Kukai' || walletData.type !== 'FullWallet') {
        throw new Error(`Unsupported wallet format`);
      }
      this.walletService.wallet = this.walletService.emptyWallet();
      this.walletService.wallet.identity = this.importIdentity(walletData.pkh);
      this.walletService.wallet.encryptedMnemonic = walletData.seed;
      this.walletService.wallet.salt = walletData.salt;
      await this.findNumberOfAccounts(walletData.pkh);
      return true;
    } catch (err) {
      this.messageService.addError(err);
      return false;
    }
  }
  importIdentity(pkh: string): Identity {
    return {
      pkh: pkh,
      balance: 0,
      pending: 0,
      balanceFiat: 0,
      pendingFiat: 0
    };
  }
  findNumberOfAccounts(pkh: string) {
    console.log('Find accounts...');
    this.http.get('http://api.tzscan.io/v1/number_operations/' + pkh + '?type=Origination').subscribe(
      data => this.findAccounts(pkh, data[0]),
      err => this.messageService.addError(JSON.stringify(err))
    );
  }
  findAccounts(pkh: string, n: number) {
    console.log('Accounts found: ' + n);
    this.http.get('http://api.tzscan.io/v1/operations/' + pkh + '?type=Origination&number=' + n + '&p=0').subscribe(
      data => {
        for (let i = 0; i < n; i++) {
          this.walletService.addAccount(data[i].type.tz1);
          console.log('Added: ' + data[i].type.tz1);
          this.balanceService.getAccountBalance(i);
        }
        this.walletService.storeWallet();
      },
      err => this.messageService.addError(JSON.stringify(err))
    );
  }
}