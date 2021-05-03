import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { WalletService } from '../../services/wallet/wallet.service';
import { CoordinatorService } from '../../services/coordinator/coordinator.service';
import { Account, TorusWallet } from '../../services/wallet/wallet';
import { LookupService } from '../../services/lookup/lookup.service';
import { MessageService } from '../../services/message/message.service';
import { CONSTANTS as _CONSTANTS } from '../../../environments/environment';
import { ActivityService } from '../../../../src/app/services/activity/activity.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() activeAccount: Account;
  @Input() settings = false;
  impAccs: Account[];
  readonly CONSTANTS = _CONSTANTS;
  constructor(
    private router: Router,
    public walletService: WalletService,
    public lookupService: LookupService,
    private coordinatorService: CoordinatorService,
    private messageService: MessageService,
    private activityService: ActivityService
  ) { }
  ngOnInit(): void {
    if (this.walletService.wallet) {
      this.impAccs = this.walletService.wallet.implicitAccounts;
    }
  }
  logout() {
    this.coordinatorService.stopAll();
    this.messageService.clear();
    this.walletService.clearWallet();
    this.lookupService.clear();
    this.router.navigate(['']);
  }
  getUsername() {
    if (this.walletService.wallet instanceof TorusWallet) {
      return this.walletService.wallet.displayName();
    }
    // const domain = this.activityService.getDomainAlias(this.activeAccount?.pkh);
    // if (domain) { return domain; }

    return '';
  }
  getVerifier() {
    if (this.walletService.wallet instanceof TorusWallet) {
      return this.walletService.wallet.verifier;
    }
    // const domain = this.activityService.getDomainAlias(this.activeAccount?.pkh);
    // if (domain) { return 'domain'; }

    return '';
  }
  getAccountAlias(account: Account) {
    return account.shortAddress();
  }
}
