import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all, hash } from 'rsvp';
import { A } from '@ember/array';

export default Route.extend({
	handler: service('serviceResultHandler'),
	cookies: service(),
	model() {
		const { store, cookies, handler } = this,
			pageScenarioModel = this.modelFor('page-scenario'),
			{ proposal, tmpHeadQ, selfGoodsConfigs, destConfigHospitals, barLineKeys } = pageScenarioModel;

		let paper = null,
			hospitalSalesReports = A([]),
			hospitalSalesReportsHospitals = A([]),
			uniqByProducts = A([]),
			formatHospitalSalesReports = A([]),
			tableHeadHosp = A([]),
			tableBodyHosp = A([]),
			doubleCircleHosp = A([]),
			increaseSalesReports = A([]),
			barLineDataHosp = A([]);

		return store.query('paper', {
			'proposal-id': proposal.get('.id'),
			'account-id': cookies.read('account_id'),
			'chart-type': 'hospital-sales-report-summary'
		}).then(data => {
			paper = data.firstObject;
			return paper.get('salesReports');
		})
			.then(data => {
				increaseSalesReports = data.sortBy('time');

				return all(increaseSalesReports.map(ele => ele.get('hospitalSalesReports')));
			}).then(data => {
				let hospitalSalesReportIds = handler.getReportIds(data);

				// 通过 hospitalSalesReport 的 id，获取其关联的 city(cities)
				return all(hospitalSalesReportIds.map(ele => {
					return store.findRecord('hospitalSalesReport', ele);
				}));
			})
			.then(data => {
				hospitalSalesReports = data;
				return all(data.map(ele => ele.get('resourceConfig')));
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
				doubleCircleHosp = handler.salesConstruct(formatHospitalSalesReports);
				// 医院销售趋势图
				barLineDataHosp = handler.salesTrend(barLineKeys, formatHospitalSalesReports, tmpHeadQ);

				let hospCustomHead = [`指标贡献率`, `指标增长率`, `指标达成率`, `销售额同比增长`, `销售额环比增长`, `销售额贡献率`,
					`YTD销售额`];

				tableHeadHosp.push('医院名称', '代表', '患者数量', '药品准入情况');
				tableHeadHosp = handler.generateTableHead(tableHeadHosp, tmpHeadQ, hospCustomHead);
				tableBodyHosp = destConfigHospitals.map(ele => {
					let lastSeasonReports = formatHospitalSalesReports.slice(-1).lastObject.dataReports,
						currentItem = lastSeasonReports.findBy('hospital.id', ele.get('hospitalConfig.hospital.id')),
						currentItemReport = currentItem.report,
						currentItemTotalSeason = formatHospitalSalesReports.map(item => {
							return item.dataReports.findBy('hospital.id', ele.get('hospitalConfig.hospital.id'));
						}),
						result = A([]);

					result = [
						ele.get('hospitalConfig.hospital.name'),
						currentItemReport.get('resourceConfig.representativeConfig.representative.name'),
						currentItemReport.patientCount,
						currentItemReport.drugEntranceInfo,
						currentItemReport.quotaContribute,
						currentItemReport.quotaGrowth,
						currentItemReport.quotaAchievement,
						currentItemReport.salesYearOnYear,
						currentItemReport.salesMonthOnMonth,
						currentItemReport.salesContribute,
						currentItemReport.ytdSales

					];
					result.push(...currentItemTotalSeason.map(item => item.report.salesQuota));
					result.push(...currentItemTotalSeason.map(item => item.report.sales));
					return result;
				});
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
