import Component from '@ember/component';
import { computed } from '@ember/object';
import Table from 'ember-light-table';
import { isEmpty } from '@ember/utils';

export default Component.extend({
	iconSortable: 'sort',
	iconAscending: 'sort-up',
	iconDescending: 'sort-down',
	iconComponent: 'sort-icon',
	sortIcons: computed('iconSortable', 'iconAscending', 'iconDescending', 'iconComponent', function () {
		return this.getProperties(['iconSortable', 'iconAscending', 'iconDescending', 'iconComponent']);
	}).readOnly(),
	sort: '',
	dir: 'asc',
	sortedModel: computed.sort('model', 'sortBy').readOnly(),
	sortBy: computed('dir', 'sort', function () {
		return [`${this.get('sort')}:${this.get('dir')}`];
	}).readOnly(),
	setRows: function (rows, thisInstance) {
		thisInstance.get('table').setRows([]);
		thisInstance.get('table').setRows(rows);
	},
	filterAndSortModel(thisInstance) {
		let model = thisInstance.get('sortedModel');

		thisInstance.get('setRows')(model, thisInstance);
	},
	columns: computed(function () {
		return [{
			label: '医院名称',
			valuePath: 'hospitalName',
			sortable: false,
			width: '150px'
		}, {
			label: '医院等级',
			valuePath: 'hospitalLevel',
			sortable: false
		}, {
			label: '患者数量',
			valuePath: 'patientNumber',
			cellComponent: 'light-table-format-number'
		}, {
			label: '上季度销售额',
			valuePath: 'sales',
			cellComponent: 'light-table-format-number'
		}, {
			label: '代表',
			valuePath: 'representative',
			sortable: false
		}, {
			label: '销售目标设定',
			valuePath: 'salesTarget',
			cellComponent: 'light-table-format-number'
		}, {
			label: '预算费用',
			valuePath: 'budget',
			cellComponent: 'light-table-format-number'
		}];
	}),

	table: computed('model', function () {
		let handledData = [],
			data = this.get('model');

		if (isEmpty(data)) {
			return new Table(this.get('columns'), handledData);
		}
		data.forEach(function (d) {
			let temp = {
				hospitalName: '',
				hospitalLevel: '',
				patientNumber: '',
				sales: '',
				representative: '',
				salesTarget: '',
				budget: ''
			};

			temp.hospitalName = d.hospitalName;
			temp.hospitalLevel = d.hospitalLevel;
			temp.patientNumber = d.patientNumber;
			temp.sales = d.sales;
			temp.representative = d.representative;
			temp.salesTarget = d.salesTarget;
			temp.budget = d.budget;
			handledData.push(temp);
		});
		return new Table(this.get('columns'), handledData);
	}),
	actions: {
		sortColumn(column) {
			if (column.sortable) {
				this.setProperties({
					dir: column.ascending ? 'asc' : 'desc',
					sort: column.get('valuePath')
				});
				// this.set('sort', column.get('valuePath'));
				this.get('filterAndSortModel')(this);
			}
		},
		onColumnClick(column) {
			if (column.sorted) {
				this.setProperties({
					dir: column.ascending ? 'asc' : 'desc',
					sort: column.get('valuePath')
				});
				// this.set('sort', column.get('valuePath'));
				this.get('filterAndSortModel')(this);
			}
		},
		onAfterResponsiveChange(matches) {
			if (matches.indexOf('jumbo') > -1) {
				this.get('table.expandedRows').setEach('expanded', false);
			}
		},
		onScrolledToBottom() {
			if (this.get('canLoadMore')) {
				this.incrementProperty('page');
				this.get('fetchRecords').perform();
			}
		}
	}

});
