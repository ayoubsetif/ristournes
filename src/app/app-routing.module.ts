import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ObjectivesComponent } from './objectives/objectives.component';
import { MainComponent } from './main/main.component';
import { AchivementComponent } from './achivement/achivement.component';

const routes: Routes = [
	{ component: MainComponent, path : '' },
	{ component: ObjectivesComponent, path: 'objectives' },
	{ component: AchivementComponent, path: 'achivements' },
	{ component: AchivementComponent, path: 'achivements/:cred' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
