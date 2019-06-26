import Controller from '@ember/controller';
import { copy } from '@ember/object/internals';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';

export default Controller.extend({
	filterTableData: computed('model.tableDataAll', 'tmpGc', 'tmpSeason', function () {
		// let tableData = copy(this.get('model.tableDataAll')),
		let tableData = copy(this.get('model.tableData')),
			tmpGc = this.get('tmpGc'),
			tmpSeason = this.get('tmpSeason'),
			filterTableData = tableData.findBy('scenarioId', tmpSeason.id).data;

		if (!isEmpty(tmpGc)) {
			let tmpTableData = filterTableData.map(ele => {
				let goodsInputs = ele.goodsInputs,
					tmpGcProductId = tmpGc.get('productConfig.product.id'),
					currentProductLastSeasonSales = ele.lastSeasonProductSales.findBy('goodsConfig.productConfig.product.id', tmpGcProductId),
					currentProductSalesConfig = ele.currentSalesConfigs.findBy('goodsConfig.productConfig.product.id', tmpGcProductId);

				goodsInputs.forEach(item => {
					let itemProductId = item.get('goodsConfig.productConfig.product.id');

					if (itemProductId === tmpGcProductId) {
						ele.salesTarget = item.get('salesTarget');
						ele.budget = item.get('budget');
					}
				});
				ele.sales = isEmpty(currentProductLastSeasonSales) ? '-' : currentProductLastSeasonSales.get('sales');
				ele.patientNumber = Number.prototype.toLocaleString.call(currentProductSalesConfig.get('patientCount'));
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
