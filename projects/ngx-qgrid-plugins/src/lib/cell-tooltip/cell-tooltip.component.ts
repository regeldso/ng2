import {
	ChangeDetectorRef,
	ChangeDetectionStrategy,
	Component,
	OnInit,
	OnDestroy,
	Input,
	ApplicationRef,
	NgZone
} from '@angular/core';
import { EventListener } from '@qgrid/core/event/event.listener';
import { EventManager } from '@qgrid/core/event/event.manager';
import { UnsubscribableLike } from '@qgrid/core/rx/rx';
import { DomTd, GridPlugin, TemplateHostService } from '@qgrid/ngx';

@Component({
	selector: 'q-grid-cell-tooltip',
	templateUrl: './cell-tooltip.component.html',
	providers: [GridPlugin, TemplateHostService],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellTooltipComponent implements OnInit, OnDestroy {
	@Input() showDelay: number;
	context: { $implicit: DomTd } = {
		$implicit: null,
	};
	cellElement: HTMLElement;
	subscription: UnsubscribableLike;
	constructor(
		private plugin: GridPlugin,
		private cd: ChangeDetectorRef,
		private appRef: ApplicationRef,
		private zone: NgZone
	) {}

	ngOnInit() {
		const { model, observe, table, disposable } = this.plugin;
		const subscription = observe(model.highlightChanged)
			.subscribe(e => {
				if (e.hasChanges('cell') && e.state.cell) {
					const { rowIndex, columnIndex } = e.state.cell;
					const domCell = table.body.cell(rowIndex, columnIndex);
					if (domCell.model()) {
						this.context = { $implicit: domCell.model() };
						this.cellElement = domCell.element;

						const listener = new EventListener(this.cellElement, new EventManager(this));
						disposable.add(
							listener.on('mouseleave', () => {
								this.cellElement = null;
								this.invalidate();
							})
						);


						this.addTooltipLayer();
					}
				}
			});
	}

	ngOnDestroy() {
		if (this.subscription) {
			this.subscription.unsubscribe();
			this.subscription = null;
		}
	}

	private addTooltipLayer(): void {
		const tooltipLayer = 'tooltip';
		const table = this.plugin.table;
		if (table.view.hasLayer(tooltipLayer)) {
			table.view.removeLayer(tooltipLayer);
		}

		table.view.addLayer(tooltipLayer);
		this.invalidate();
	}

	private invalidate(): void {
		// ToDo: Investigate how to improve.
		this.cd.markForCheck();
		this.cd.detectChanges();
		this.appRef.tick();
	}
}
