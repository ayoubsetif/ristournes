import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ObjectivesComponent } from './objectives/objectives.component';
import { MainComponent } from './main/main.component';
import { AchivementComponent } from './achivement/achivement.component';
import { AdminComponent } from './admin/admin.component';

const routes: Routes = [
	{ component: MainComponent, path : '' },
	{ component: ObjectivesComponent, path: 'objectives' },
	{ component: AchivementComponent, path: 'achivements' },
	{ component: AdminComponent, path: 'admin' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
