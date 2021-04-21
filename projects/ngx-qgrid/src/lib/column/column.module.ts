import { NgModule } from '@angular/core';
import { ColumnComponent } from './column.component';
import { ColumnDirective } from './column.directive';

@NgModule({
	declarations: [
		ColumnComponent,
		ColumnDirective
	],
	exports: [
		ColumnComponent,
		ColumnDirective
	]
})
export class ColumnModule {
}
