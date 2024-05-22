import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-staking',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule],
  templateUrl: './staking.component.html',
  
})
export class StakingComponent {
  formData: any = {
    depositToken: '',
    rewardToken: '',
    startTime: 0,
    endTime: 0,
    rewardInterval: 0,
    rewardRate: 0
  };



  submitForm() {
    // Implement form submission logic here
    console.log(this.formData);
  }
}
