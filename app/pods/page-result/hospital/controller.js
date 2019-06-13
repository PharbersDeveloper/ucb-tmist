import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import EmberObject, { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Controller.extend({
	circlePie: A([0, 90]),
	handler: service('serviceResultHandler'),
	barLineData: computed('hospChooseHosp', 'chooseProd', function () {
		if (ENV.environment === 'development') {
			window.console.log('recomputed 醫院销售趋势图');
		}
		const { model } = this,
			{ formatHospitalSalesReports } = model,
			handler = this.handler;

		let { hospChooseHosp, chooseGoods } = this,
			findHospItemValue = isEmpty(hospChooseHosp) ? hospChooseHosp : hospChooseHosp.get('hospitalConfig.hospital.id'),
			findHospItemKey = 'hospital.id',
			findGoodsValue = isEmpty(chooseGoods) ? chooseGoods : chooseGoods.get('productConfig.product.id'),
			findGoodsKey = 'goodsConfig.productConfig.product.id';

		return handler.changeTrendData(model.barLineDataHosp, formatHospitalSalesReports, findHospItemKey, findHospItemValue, findGoodsKey, findGoodsValue);
	}),
	tableData: computed('chooseProdTable', function () {
		if (ENV.environment === 'development') {
			window.console.log('recomputed 医院销售数据表');
		}
		const { model, handler } = this,
			{ formatHospitalSalesReports, destConfigHospitals } = model;

		let lastSeasonReports = formatHospitalSalesReports.slice(-1).lastObject.dataReports,
			chooseProdTable = this.chooseProdTable,
			productId = '';

		if (isEmpty(chooseProdTable)) {
			return model.tableBodyHosp;
		}
		productId = chooseProdTable.get('productConfig.product.id');
		return handler.generateHospitalTableData(destConfigHospitals, lastSeasonReports, formatHospitalSalesReports, productId);

		// return destConfigHospitals.map(ele => {

		// 	let currentItems = handler.findCurrentItem(lastSeasonReports, 'hospital.id', ele.get('hospitalConfig.hospital.id')),
		// 		currentItemsByProds = handler.findCurrentItem(currentItems, 'goodsConfig.productConfig.product.id', productId),
		// 		currentValue = EmberObject.create({
		// 			patientCount: 0,
		// 			quotaContribute: 0,
		// 			quotaGrowth: 0,
		// 			quotaAchievement: 0,
		// 			salesYearOnYear: 0,
		// 			salesMonthOnMonth: 0,
		// 			salesContribute: 0,
		// 			ytdSales: 0,
		// 			drugEntranceInfo: '',
		// 			representative: ''
		// 		}),
		// 		currentItemReport = currentItemsByProds.reduce((acc, current) => {
		// 			acc.patientCount += Number(current.report.patientCount);
		// 			acc.quotaContribute += current.report.quotaContribute;
		// 			acc.quotaGrowth += current.report.quotaGrowth;
		// 			acc.quotaAchievement += current.report.quotaAchievement;
		// 			acc.salesYearOnYear += current.report.salesYearOnYear;
		// 			acc.salesMonthOnMonth += current.report.salesMonthOnMonth;
		// 			acc.salesContribute += current.report.salesContribute;
		// 			acc.ytdSales += current.report.ytdSales;
		// 			acc.drugEntranceInfo = current.report.drugEntranceInfo;

		// 			return acc;
		// 		}, currentValue),
		// 		currentItemTotalSeason = formatHospitalSalesReports.map(item => {
		// 			let currentSeason = handler.findCurrentItem(item.dataReports, 'representative.id', ele.get('representativeConfig.representative.id')),
		// 				currentSeasonByProds = handler.findCurrentItem(currentSeason, 'goodsConfig.productConfig.product.id', productId),
		// 				values = EmberObject.create({
		// 					salesQuota: 0,
		// 					sales: 0
		// 				});

		// 			return currentSeasonByProds.reduce((acc, current) => {
		// 				acc.salesQuota += current.report.salesQuota;
		// 				acc.sales += current.report.sales;
		// 				return acc;
		// 			}, values);
		// 		}),
		// 		result = A([]);

		// 	result = [
		// 		ele.get('hospitalConfig.hospital.name'),
		// 		currentItemsByProds.firstObject.resourceConfig.get('representativeConfig.representative.name'),
		// 		currentItemReport.patientCount,
		// 		currentItemReport.drugEntranceInfo,
		// 		currentItemReport.quotaContribute,
		// 		currentItemReport.quotaGrowth,
		// 		currentItemReport.quotaAchievement,
		// 		currentItemReport.salesYearOnYear,
		// 		currentItemReport.salesMonthOnMonth,
		// 		currentItemReport.salesContribute,
		// 		currentItemReport.ytdSales

		// 	];
		// 	result.push(...currentItemTotalSeason.map(item => item.salesQuota));
		// 	result.push(...currentItemTotalSeason.map(item => item.sales));
		// 	return result;
		// });
	})
});
