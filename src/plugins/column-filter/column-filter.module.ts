import { NgModule } from '@angular/core';
import { TemplateModule } from 'ng2-qgrid/template';
import { ColumnFilterComponent } from './column-filter.component';
import { ColumnFilterTriggerComponent } from './column-filter-trigger.component';

@NgModule({
	declarations: [
		ColumnFilterComponent,
		ColumnFilterTriggerComponent
	],
	exports: [
		ColumnFilterComponent,
		ColumnFilterTriggerComponent
	],
	imports: [
		TemplateModule
	],
	providers: []
})
export class ColumnFilterModule { }