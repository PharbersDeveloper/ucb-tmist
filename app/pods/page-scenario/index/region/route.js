import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all, hash } from 'rsvp';
import { A } from '@ember/array';

export default Route.extend({
	handler: service('serviceResultHandler'),
	model() {

		const store = this.store,
			handler = this.handler,
			pageResultModel = this.modelFor('page-scenario'),
			{ increaseSalesReports, tmpHeadQ, selfGoodsConfigs, destConfigRegions, barLineKeys } = pageResultModel;

		let citySalesReports = A([]),
			citySalesReportsCities = A([]),
			formatCitySalesReports = A([]),
			cities = A([]),
			tableHeadCity = A([]),
			tableBodyCity = A([]),
			doubleCircleCity = A([]),
			barLineDataCity = A([]);

		//	获取所有 salesReport 下的地区销售报告 citySalesReport
		return all(increaseSalesReports.map(ele => ele.get('citySalesReports')))
			.then(data => {
				let citySalesReportIds = handler.getReportIds(data);

				// 通过 pcitySalesReport 的 id，获取其关联的 city(cities)
				return all(citySalesReportIds.map(ele => {
					return store.findRecord('citySalesReport', ele);
				}));
			}).then(data => {
				citySalesReports = data;
				// 获取关联的所有城市信息
				return all(data.map(ele => ele.get('city')));
			}).then(data => {
				citySalesReportsCities = data.map((ele, index) => {
					return {
						name: ele.name,
						city: ele,
						goodsConfig: citySalesReports[index].goodsConfig,
						report: citySalesReports[index]
					};
				});
				return destConfigRegions.firstObject.get('regionConfig');
			}).then(data => {
				return data.get('region');
			}).then(data => {
				cities = data.get('cities');
				// 整理季度数据
				formatCitySalesReports = handler.formatReports(tmpHeadQ, citySalesReportsCities, cities.length);
				// 城市销售结构分布图
				doubleCircleCity = handler.salesConstruct(formatCitySalesReports);
				// 城市销售趋势图
				barLineDataCity = handler.salesTrend(barLineKeys, formatCitySalesReports, tmpHeadQ);

				let cityCustomHead = [`指标贡献率`, `指标增长率`, `指标达成率`, `销售额同比增长`, `销售额环比增长`, `销售额贡献率`,
					`YTD销售额`];

				tableHeadCity.push('城市名称', '患者数量');
				tableHeadCity = handler.generateTableHead(tableHeadCity, tmpHeadQ, cityCustomHead);
				tableBodyCity = cities.map(ele => {
					let lastSeasonReports = formatCitySalesReports.slice(-1).lastObject.dataReports,
						currentCity = lastSeasonReports.findBy('city.id', ele.get('id')),
						currentCityReport = currentCity.report,
						currentCityTotalSeason = formatCitySalesReports.map(item => {
							return item.dataReports.findBy('city.id', ele.get('id'));
						}),
						result = A([]);

					result = [
						ele.get('name'),
						currentCityReport.patientCount,
						currentCityReport.quotaContribute,
						currentCityReport.quotaGrowth,
						currentCityReport.quotaAchievement,
						currentCityReport.salesYearOnYear,
						currentCityReport.salesMonthOnMonth,
						currentCityReport.salesContribute,
						currentCityReport.ytdSales

					];
					result.push(...currentCityTotalSeason.map(item => item.report.salesQuota));
					result.push(...currentCityTotalSeason.map(item => item.report.sales));
					return result;
				});
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
		this.controller.set('doubleCircleData', model.doubleCircleCity);
		this.controller.set('tableHead', model.tableHeadCity);
		this.controller.set('tableBody', model.tableBodyCity);
	}
});
