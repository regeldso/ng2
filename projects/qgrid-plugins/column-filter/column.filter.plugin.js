import { Command } from '@qgrid/core/command/command';
import * as columnService from '@qgrid/core/column/column.service';
import { getFactory as labelFactory } from '@qgrid/core/services/label';
import { clone } from '@qgrid/core/utility/kit';
import { Event } from '@qgrid/core/event/event';

export class ColumnFilterPlugin {
	constructor(plugin, context) {
		const { model } = plugin;

		this.plugin = plugin;
		this.key = context.key;

		this.cancelEvent = new Event();
		this.submitEvent = new Event();
		this.resetEvent = new Event();

		const filterBy = model.filter().by[this.key];
		this.by = new Set((filterBy && filterBy.items) || []);
		this.byBlanks = !!(filterBy && filterBy.blanks);

		this.operator = filterBy && filterBy.expression && filterBy.expression.op || 'contains';
		this.value = filterBy && filterBy.expression && filterBy.expression.right || null;

		this.items = [];

		Object.assign(this, this.commands);

		this.column = columnService.find(model.columnList().line, this.key);
		this.title = this.column.title;
		this.getValue = labelFactory(this.column);
	}

	state(item) {
		return this.by.has(item);
	}

	stateAll() {
		return this.items.every(this.state.bind(this)) && (!this.hasBlanks || this.byBlanks);
	}

	isIndeterminate() {
		return !this.stateAll() && (this.items.some(this.state.bind(this)) || this.byBlanks);
	}

	isEmpty() {
		return !!this.by.size || this.byBlanks;
	};

	get commands() {
		return {
			toggle: new Command({
				source: 'column.filter.view',
				execute: (item) => {
					if (this.by.has(item)) {
						this.by.delete(item);
					}
					else {
						this.by.add(item);
					}

					this.by = new Set(this.by);
				}
			}),
			toggleAll: new Command({
				source: 'column.filter.view',
				execute: search => {
					const state = !this.stateAll();
					if (state) {
						for (let item of this.items) {
							this.by.add(item);
						}
					}
					else {
						if (search) {
							for (let item of this.by) {
								if (this.items.indexOf(item) >= 0) {
									this.by.delete(item);
								}
							}
						}
						else {
							this.by.clear();
						}
					}

					this.by = new Set(this.by);
					this.byBlanks = this.hasBlanks && state;
				}
			}),

			changeOperator: new Command({
				source: 'column.filter.view',
				execute: (op) => {
					this.operator = op;

					let { value } = this;
					switch (op) {
						case 'between': {
							if (!Array.isArray(value)) {
								this.value = [value];
							}
							break;
						}
						default: {
							if (Array.isArray(value)) {
								this.value = value[0];
							}
							break;
						}
					}
				}
			}),

			submit: new Command({
				source: 'column.filter.view',
				execute: () => {
					const { model } = this.plugin;
					const by = clone(model.filter().by);

					const filter = by[this.key] || {};

					filter.items = Array.from(this.by);
					filter.blanks = this.byBlanks;

					if (this.operator !== 'contains') {
						filter.expression = {
							kind: 'condition',
							op: this.operator,
							left: this.key,
							right: this.value,
						};
						filter.items = [];
					} else {
						delete filter.expression;
					}

					if ((filter.items && filter.items.length) || filter.blanks || filter.expression) {
						by[this.key] = filter;
					}
					else {
						delete by[this.key];
					}

					model.filter({ by }, { source: 'column.filter.view' });

					this.submitEvent.emit();
				}
			}),

			cancel: new Command({
				source: 'column.filter.view',
				execute: () => this.cancelEvent.emit()
			}),

			reset: new Command({
				source: 'column.filter.view',
				execute: () => {
					this.by = new Set();
					this.byBlanks = false;
					this.value = this.operator === 'between' ? [] : null;
					this.resetEvent.emit();
				}
			}),
		};
	}
}