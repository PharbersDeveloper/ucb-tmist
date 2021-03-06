import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Controller.extend({
	circlePie: A([0, 90]),
	handler: service('serviceResultHandler'),
	barLineData: computed('regionChooseCity.id', 'chooseProd', 'date', function () {
		if (ENV.environment === 'development') {
			window.console.log('recomputed 地区销售趋势图');
		}
		const { regionChooseCity, chooseProd, model } = this,
			{ formatCitySalesReports } = model,
			handler = this.handler;

		// let findCityItemValue = isEmpty(regionChooseCity) ? regionChooseCity : regionChooseCity.get('id'),
		let findCityItemValue = isEmpty(regionChooseCity) ? regionChooseCity : regionChooseCity.get('name'),
			findCityItemKey = 'name',
			// findCityItemKey = 'city.id',
			findGoodsValue = isEmpty(chooseProd) ? chooseProd : chooseProd.get('productConfig.product.id'),
			// findGoodsKey = 'goodsConfig.productConfig.product.id';
			findGoodsKey = 'productId';

		return handler.changeTrendData(model.barLineDataCity, formatCitySalesReports, findCityItemKey, findCityItemValue, findGoodsKey, findGoodsValue);
	}),
	tableData: computed('chooseProdTable', 'date', function () {
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
