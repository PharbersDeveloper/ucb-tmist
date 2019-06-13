import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import EmberObject from '@ember/object';
import { all, hash } from 'rsvp';
import { A } from '@ember/array';

export default Route.extend({
	handler: service('serviceResultHandler'),
	cookies: service(),
	model() {
		const { store, handler, cookies } = this,
			pageResultModel = this.modelFor('page-result'),
			{ detailProposal, tmpHeadQ, selfGoodsConfigs, destConfigHospitals, barLineKeys } = pageResultModel;

		let paper = null,
			increaseSalesReports = A([]),
			hospitalSalesReports = A([]),
			hospitalSalesReportsHospitals = A([]),
			uniqByProducts = A([]),
			formatHospitalSalesReports = A([]),
			tableHeadHosp = A([]),
			tableBodyHosp = A([]),
			doubleCircleHosp = A([]),
			barLineDataHosp = A([]);

		return detailProposal.get('proposal')
			.then(data => {

				return store.query('paper', {
					'proposal-id': data.get('id'),
					'account-id': cookies.read('account_id'),
					'chart-type': 'hospital-sales-report-summary'
				});
			}).then(data => {
				paper = data.firstObject;
				return paper.get('salesReports');
			}).then(data => {
				increaseSalesReports = data.sortBy('time');

				return all(increaseSalesReports.map(ele => ele.get('hospitalSalesReports')));
			})
			.then(data => {
				let hospitalSalesReportIds = handler.getReportIds(data);

				// 通过 hospitalSalesReport 的 id，获取其关联的 city(cities)
				return all(hospitalSalesReportIds.map(ele => {
					return store.findRecord('hospitalSalesReport', ele);
				}));
			})
			.then(data => {
				hospitalSalesReports = data.filter(ele => ele.get('destConfigId') !== '-1');
				return all(hospitalSalesReports.map(ele => ele.get('resourceConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('representativeConfig')));
			}).then(data => {
				// 获取到医院下的代表，之后展示使用
				return all(data.map(ele => ele.get('representative')));
			}).then(() => {

				return all(hospitalSalesReports.map(ele => ele.get('destConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('hospitalConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('hospital')));
			}).then(data => {
				hospitalSalesReportsHospitals = data.map((ele, index) => {
					return {
						name: ele.name,
						hospital: ele,
						report: hospitalSalesReports[index],
						goodsConfig: hospitalSalesReports[index].goodsConfig,
						resourceConfig: hospitalSalesReports[index].resourceConfig
					};
				});
				uniqByProducts = hospitalSalesReportsHospitals.uniqBy('goodsConfig.productConfig.product.id');

				// 整理季度数据
				formatHospitalSalesReports = handler.formatReports(tmpHeadQ, hospitalSalesReportsHospitals, destConfigHospitals.length * uniqByProducts.length);
				// 医院销售结构分布图

				// doubleCircleHosp = handler.salesConstruct(formatHospitalSalesReports);

				doubleCircleHosp = paper.get('salesReports').slice(-2).map(ele => {
					let summary = ele.hospitalSalesReportSummary;

					return {
						seriesName: summary.scenarioName,
						data: summary.values.map(item => {
							return {
								value: item.sales,
								name: item.hospitalLevel
							};
						})
					};
				});
				// 医院销售趋势图
				barLineDataHosp = handler.salesTrend(barLineKeys, formatHospitalSalesReports, tmpHeadQ);

				let hospCustomHead = [`指标贡献率`, `指标增长率`, `指标达成率`, `销售额同比增长`, `销售额环比增长`, `销售额贡献率`, `YTD销售额`],
					lastSeasonReports = formatHospitalSalesReports.slice(-1).lastObject.dataReports;

				tableHeadHosp.push('医院名称', '代表', '患者数量', '药品准入情况');
				tableHeadHosp = handler.generateTableHead(tableHeadHosp, tmpHeadQ, hospCustomHead);
				tableBodyHosp = handler.generateHospitalTableData(destConfigHospitals, lastSeasonReports, formatHospitalSalesReports);

				// tableBodyHosp = destConfigHospitals.map(ele => {

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
				return hash({
					selfGoodsConfigs,
					destConfigHospitals,
					hospitalSalesReports,
					hospitalSalesReportsHospitals,
					formatHospitalSalesReports,
					tableHeadHosp,
					tableBodyHosp,
					doubleCircleHosp,
					barLineDataHosp,
					uniqByProducts
				});
			});
	},
	setupController(controller, model) {
		this._super(controller, model);
		this.controller.set('doubleCircleData', model.doubleCircleHosp);
		this.controller.set('tableHead', model.tableHeadHosp);
		this.controller.set('tableBody', model.tableBodyHosp);
	}
});
