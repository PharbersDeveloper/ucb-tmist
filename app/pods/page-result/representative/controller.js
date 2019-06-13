import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Controller.extend({
	circlePie: A([0, 90]),
	handler: service('serviceResultHandler'),
	barLineData: computed('repChooseRep', 'chooseProd', function () {
		if (ENV.environment === 'development') {
			window.console.log('recomputed 代表销售趋势图');
		}
		const { model, handler } = this,
			{ formatRepresentativeSalesReports } = model;

		let { repChooseRep, chooseProd } = this,
			findRepItemValue = isEmpty(repChooseRep) ? repChooseRep : repChooseRep.get('representativeConfig.representative.id'),
			findRepItemKey = 'representative.id',
			findGoodsValue = isEmpty(chooseProd) ? chooseProd : chooseProd.get('productConfig.product.id'),
			findGoodsKey = 'goodsConfig.productConfig.product.id';

		return handler.changeTrendData(model.barLineDataRep, formatRepresentativeSalesReports, findRepItemKey, findRepItemValue, findGoodsKey, findGoodsValue);
	}),
	tableData: computed('chooseProdTable', function () {
		if (ENV.environment === 'development') {
			window.console.log('recomputed 代表销售数据表');
		}
		const { model, handler } = this,
			{ formatRepresentativeSalesReports, resourceConfigRepresentatives } = model;

		let lastSeasonReports = formatRepresentativeSalesReports.slice(-1).lastObject.dataReports,
			chooseProdTable = this.chooseProdTable,
			productId = '';

		if (isEmpty(chooseProdTable)) {
			return model.tableBodyRep;
		}
		productId = chooseProdTable.get('productConfig.product.id');
		return handler.generateRepTableData(resourceConfigRepresentatives, lastSeasonReports, formatRepresentativeSalesReports, productId);

	})
});
