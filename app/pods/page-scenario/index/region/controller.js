import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import EmberObject, { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Controller.extend({
	circlePie: A([0, 90]),
	handler: service('serviceResultHandler'),
	barLineData: computed('regionChooseCity.id', 'chooseProd', function () {
		if (ENV.environment === 'development') {
			window.console.log('recomputed 地区销售趋势图');
		}
		const { regionChooseCity, chooseProd, model } = this,
			{ formatCitySalesReports } = model,
			handler = this.handler;

		let findCityItemValue = isEmpty(regionChooseCity) ? regionChooseCity : regionChooseCity.get('id'),
			findCityItemKey = 'city.id',
			findGoodsValue = isEmpty(chooseProd) ? chooseProd : chooseProd.get('productConfig.product.id'),
			findGoodsKey = 'goodsConfig.productConfig.product.id';

		return handler.changeTrendData(model.barLineDataCity, formatCitySalesReports, findCityItemKey, findCityItemValue, findGoodsKey, findGoodsValue);
	}),
	tableData: computed('chooseProdTable', function () {
		if (ENV.environment === 'development') {
			window.console.log('recomputed 区域销售数据表');
		}
		const { model, handler } = this,
			{ formatCitySalesReports, cities } = model;

		let lastSeasonReports = formatCitySalesReports.slice(-1).lastObject.dataReports,
			chooseProdTable = this.chooseProdTable,
			productId = '';

		if (isEmpty(chooseProdTable)) {
			return model.tableBodyCity;
		}
		productId = chooseProdTable.get('productConfig.product.id');
		return handler.generateRegionTableData(cities, lastSeasonReports, formatCitySalesReports, productId);
	})
});
