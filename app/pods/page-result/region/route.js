import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all, hash } from 'rsvp';
import { A } from '@ember/array';

export default Route.extend({
	handler: service('serviceResultHandler'),
	model() {

		const store = this.store,
			handler = this.handler,
			pageResultModel = this.modelFor('page-result'),
			{ increaseSalesReports, tmpHeadQ, selfGoodsConfigs, destConfigRegions, barLineKeys } = pageResultModel;

		// let citySalesReports = A([]),
		// citySalesReportsCities = A([]),
		let formatCitySalesReports = A([]),
			cities = A([]),
			tableHeadCity = A([]),
			tableBodyCity = A([]),
			doubleCircleCity = A([]),
			increaseSalesReportsIncludeCity = A([]),
			barLineDataCity = A([]);

		//	获取所有 salesReport 下的地区销售报告 citySalesReport
		return all(increaseSalesReports.map(ele => ele.get('citySalesReports')))
			.then(data => {
				increaseSalesReportsIncludeCity = data;
				let citySalesReportIds = handler.getReportIds(data);

				// 通过 pcitySalesReport 的 id，获取其关联的 city(cities)
				return all(citySalesReportIds.map(ele => {
					return store.findRecord('citySalesReport', ele);
				}));
			}).then(data => {
				// citySalesReports = data;
				// 获取关联的所有城市信息
				return all(data.map(ele => ele.get('city')));
			}).then(() => {
				// citySalesReportsCities = data.map((ele, index) => {
				// 	return {
				// 		name: ele.name,
				// 		city: ele,
				// 		goodsConfig: citySalesReports[index].goodsConfig,
				// 		report: citySalesReports[index]
				// 	};
				// });
				return destConfigRegions.firstObject.get('regionConfig');
			}).then(data => {
				return data.get('region');
			}).then(data => {
				cities = data.get('cities');
				return data.get('cities');
			}).then(data => {
				cities = data;
				// 整理季度数据
				// formatCitySalesReports = handler.formatReports(tmpHeadQ, citySalesReportsCities, cities.length);
				formatCitySalesReports = increaseSalesReportsIncludeCity.map((ele, index) => {
					let season = tmpHeadQ[index],
						dataReports = A(ele).map(item => {
							return {
								name: item.get('city.name'),
								city: item.get('city'),
								productId: item.get('goodsConfig.productConfig.product.id'),
								goodsConfig: item.get('goodsConfig'),
								report: item
							};
						});

					return {
						season,
						dataReports
					};
				});

				// 城市销售结构分布图
				doubleCircleCity = handler.salesConstruct(formatCitySalesReports, 'city.name');
				// 城市销售趋势图
				barLineDataCity = handler.salesTrend(barLineKeys, formatCitySalesReports, tmpHeadQ);

				let cityCustomHead = [`指标贡献率`, `指标增长率`, `指标达成率`, `销售额同比增长`, `销售额环比增长`, `销售额贡献率`,
						`YTD销售额`],
					lastSeasonReports = formatCitySalesReports.slice(-1).lastObject.dataReports;


				tableHeadCity.push('城市名称', '患者数量');
				tableHeadCity = handler.generateTableHead(tableHeadCity, tmpHeadQ, cityCustomHead);

				tableBodyCity = handler.generateRegionTableData(cities, lastSeasonReports, formatCitySalesReports);
				return hash({
					formatCitySalesReports,
					cities,
					selfGoodsConfigs,
					doubleCircleCity,
					barLineDataCity,
					tableHeadCity,
					tableBodyCity
				});
			});
	},
	setupController(controller, model) {
		this._super(controller, model);
		this.controller.set('date', new Date().getTime());
	}
});
