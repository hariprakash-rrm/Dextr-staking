import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  NO_ERRORS_SCHEMA,
} from "@angular/core";
import { NavbarComponent } from "../navbar/navbar.component";
import { HomeService } from "./service/home.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: "./home.component.html",
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  styleUrls: ["./home.component.css"],
})
export class HomeComponent {
  poolDetails: any = [];
  depositAmount: any;
  showModal: boolean = false;
  currentPoolId: any;
  account: any;
  preApprovedAmount: any;
  approveOrStake: any = "Approve";
  statusIndex = 0;
  isLoading = false;

  constructor(private contractService: HomeService) {}

  ngOnInit(): void {
    setTimeout(async () => {
      try {
        const data = window.localStorage.getItem("wagmi.store");
        this.account = JSON.parse(data as any);
        this.account = this.account?.state?.data?.account;
        console.log(this.account);

        const poolLength = await this.contractService.getPoolLength();
        for (let i = 0; i < poolLength; i++) {
          try {
            const res = await this.contractService.getPoolDetails(i, this.account);
            this.poolDetails.push(res.poolInfo[0]);
            console.log(this.poolDetails);
          } catch (error) {
            console.error(`Error fetching pool details for pool ${i}:`, error);
          }
        }
      } catch (error) {
        console.error('Error during ngOnInit:', error);
      }
    }, 1000);
  }

  logChange(newValue: number) {
    if (this.preApprovedAmount < newValue) {
      this.approveOrStake = "Approve";
      this.statusIndex = 0;
      return;
    }
    this.approveOrStake = "Stake";
    this.statusIndex = 1;
  }

  async stakeModal(id: number) {
    try {
      this.showModal = true;
      this.currentPoolId = id;
      await this.getApprovedAmount();
    } catch (error) {
      console.error('Error in stakeModal:', error);
    }
  }

  async getApprovedAmount() {
    try {
      this.preApprovedAmount = await this.contractService.getApprovedAmount(this.account,this.poolDetails[this.currentPoolId].depositToken);
    } catch (error) {
      console.error('Error in getApprovedAmount:', error);
    }
  }

  async claimTestToken(){
    this.isLoading=true
    try{
      await this.contractService.getSupply().then((res:any)=>{
        if (res.status == "success") {
          alert('Token claimed')
          window.location.reload()
        } else {
          this.isLoading = false;
        }
      })
    }catch(error){
      this.isLoading=false
    }
  
  }

  async stakeNow() {
    this.isLoading = true;
    try {
      if (this.statusIndex == 0) {
        console.log(this.depositAmount);
        const res = await this.contractService.approve(this.depositAmount,this.poolDetails[this.currentPoolId].depositToken);
        console.log(res);
        if (res.status == "success") {
          await this._stakeNow();
        } else {
          this.isLoading = false;
        }
      } else {
        await this._stakeNow();
      }
    } catch (error) {
      console.error('Error in stakeNow:', error);
      this.isLoading = false;
    }
  }

  async claim(id: any) {
    this.isLoading = true;
    try {
      const res = await this.contractService.claim(id);
      if (res.status == "success") {
        alert("Successfully claimed");
        window.location.reload();
      }
      this.isLoading = false;
    } catch (error) {
      console.error('Error in claim:', error);
      this.isLoading = false;
    }
  }

  async unStake(id: any) {
    this.isLoading = true;
    try {
      const res = await this.contractService.unstake(id);
      if (res.status == "success") {
        alert("Successfully unstaked");
        window.location.reload();
      }
      this.isLoading = false;
    } catch (error) {
      console.error('Error in unStake:', error);
      this.isLoading = false;
    }
  }

  async _stakeNow() {
    try {
      const res = await this.contractService.deposit(this.currentPoolId, this.depositAmount);
      console.log(res);
      if (res.status == "success") {
        alert("Successfully staked");
        window.location.reload();
      }
      this.isLoading = false;
    } catch (error) {
      console.error('Error in _stakeNow:', error);
      this.isLoading = false;
    }
  }

  toggleModal() {
    this.showModal = !this.showModal;
    this.depositAmount = 0;
  }
}
