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
				let goodsInputs = ele.goodsInputs;

				goodsInputs.forEach(item => {
					if (item.get('goodsConfig.id') === tmpGc.get('id')) {
						ele.salesTarget = item.get('salesTarget');
						ele.budget = item.get('budget');
					}
				});
				ele.sales = ele.lastSeasonProductSales.findBy('goodsConfig.productConfig.product.id', tmpGc.get('productConfig.product.id')).get('sales');
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
