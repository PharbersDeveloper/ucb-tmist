import Controller from '@ember/controller';
import { copy } from '@ember/object/internals';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Controller.extend({
	filterTableData: computed('model.tableData', 'tmpRep', 'tmpGc', function () {
		let tableData = copy(this.get('model.tableData')),
			tmpRep = this.get('tmpRep'),
			tmpGc = this.get('tmpGc'),
			filterTableData = A([]);

		if (!isEmpty(tmpRep)) {
			filterTableData = tableData.filterBy('representative', tmpRep.get('name'));
		} else {
			filterTableData = tableData;
		}
		if (!isEmpty(tmpGc)) {
			let tmpTableData = filterTableData.map(ele => {
				let goodsConfigInputs = ele.goodsConfigInputs;

				goodsConfigInputs.forEach(item => {
					if (item.get('goodsConfig.id') === tmpGc.get('id')) {
						ele.salesTarget = item.get('salesTarget');
						ele.budget = item.get('budget');
					}
				});
				return ele;
			});

			filterTableData = tmpTableData;
		} else {
			let tmpTableData = filterTableData.map(ele => {
				ele.salesTarget = ele.totalSalesTarget;
				ele.budget = ele.totalBudget;
				return ele;
			});

			filterTableData = tmpTableData;
		}
		return filterTableData;
	})
});
