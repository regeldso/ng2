import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DataService } from '../data.service';
import { GridModel, Grid } from 'ng2-qgrid';

@Component({
	selector: 'example-look-people-model',
	templateUrl: 'example-look-people-model.component.html',
	styleUrls: ['example-look-people-model.component.scss'],
	providers: [DataService],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleLookPeopleModelComponent {
	static id = 'look-people-model';

	gridModel: GridModel = this.qgrid
		.model()
		.columnList({
			generation: 'deep'
		});

	constructor(dataService: DataService, private qgrid: Grid) {
		dataService
			.getPeople()
			.subscribe(rows => this.gridModel.data({ rows }));
	}
}
