import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { StakingComponent } from './components/staking/staking.component'
export const routes: Routes = [
    {
        path:'',
        component:HomeComponent
    },
    {
        path:'staking',
        component:StakingComponent
    }
];
