import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import { computed } from '@ember/object';
import EmberObject from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Controller.extend({
	circlePie: A([0, 90]),
	handler: service('serviceResultHandler'),
	barLineData: computed('repChooseRep', 'chooseProd', function () {
		if (ENV.environment === 'development') {
			window.console.log('recomputed 代表销售趋势图');
		}
		let { repChooseRep, chooseProd, model } = this,
			{ formatRepresentativeSalesReports } = model,
			handler = this.handler,
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
		const { model } = this,
			{ formatRepresentativeSalesReports, resourceConfigRepresentatives } = model;

		let lastSeasonReports = formatRepresentativeSalesReports.slice(-1).lastObject.dataReports;

		return resourceConfigRepresentatives.map(ele => {
			let currentItems = this.findCurrentItem(lastSeasonReports, 'representative.id', ele.get('representativeConfig.representative.id')),
				currentItemsByProds = this.findCurrentItem(currentItems, 'goodsConfig.productConfig.product.id', ''),
				currentRepValue = EmberObject.create({
					patientCount: 0,
					quotaContribute: 0,
					quotaGrowth: 0,
					quotaAchievement: 0,
					salesYearOnYear: 0,
					salesMonthOnMonth: 0,
					salesContribute: 0,
					ytdSales: 0
				}),
				currentItemReport = currentItemsByProds.reduce((acc, current) => {

					acc.patientCount += Number(current.report.patientCount);
					acc.quotaContribute += current.report.quotaContribute;
					acc.quotaGrowth += current.report.quotaGrowth;
					acc.quotaAchievement += current.report.quotaAchievement;
					acc.salesYearOnYear += current.report.salesYearOnYear;
					acc.salesMonthOnMonth += current.report.salesMonthOnMonth;
					acc.salesContribute += current.report.salesContribute;
					acc.ytdSales += current.report.ytdSales;
					return acc;
				}, currentRepValue),

				currentItemTotalSeason = formatRepresentativeSalesReports.map(item => {
					let currentSeason = this.findCurrentItem(item.dataReports, 'representative.id', ele.get('representativeConfig.representative.id')),
						currentSeasonByProds = this.findCurrentItem(currentSeason, 'goodsConfig.productConfig.product.id', ''),
						values = EmberObject.create({
							salesQuota: 0,
							sales: 0
						});

					return currentSeasonByProds.reduce((acc, current) => {
						acc.salesQuota += current.report.salesQuota;
						acc.sales += current.report.sales;
						return acc;
					}, values);
				}),
				result = A([]);

			result = [
				ele.get('representativeConfig.representative.name'),
				currentItemReport.patientCount,
				currentItemReport.quotaContribute,
				currentItemReport.quotaGrowth,
				currentItemReport.quotaAchievement,
				currentItemReport.salesYearOnYear,
				currentItemReport.salesMonthOnMonth,
				currentItemReport.salesContribute,
				currentItemReport.ytdSales

			];
			result.push(...currentItemTotalSeason.map(item => item.salesQuota));
			result.push(...currentItemTotalSeason.map(item => item.sales));
			return result;
		});
	})
});
