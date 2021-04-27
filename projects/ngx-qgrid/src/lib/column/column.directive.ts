import {
	Directive,
	Input,
	TemplateRef,
	OnInit
} from '@angular/core';
import { TemplateCacheService } from '../template/template-cache.service';
import { TemplateLink } from '../template/template-link';
import { ColumnSectionType } from '@qgrid/core/column-type/column.model';

@Directive({
	// tslint:disable-next-line
	selector: 'ng-template[qGridColumn]'
})

export class ColumnDirective implements OnInit {
	@Input('qGridColumn') key = '';
	@Input() section: string | ColumnSectionType = 'body';
	@Input() context = {};

	constructor(
		private templateCache: TemplateCacheService,
		private templateRef: TemplateRef<any>
	) {
	}

	ngOnInit() {
		const link = new TemplateLink(this.templateRef, this.context);
		this.templateCache.put(this.getKey(), link);
	}

	getKey() {
		return `${this.section}-cell-the-${this.key}.tpl.html`;
	}
}
