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
			{ increaseSalesReports, tmpHeadQ, selfGoodsConfigs, resourceConfigRepresentatives, barLineKeys } = pageResultModel;

		let representativeSalesReports = A([]),
			representativeSalesReportsResourceConfigs = A([]),
			representativeSalesReportsReps = A([]),
			formatRepresentativeSalesReports = A([]),
			tableHeadRep = A([]),
			tableBodyRep = A([]),
			doubleCircleRep = A([]),
			barLineDataRep = A([]);

		return all(increaseSalesReports.map(ele => ele.get('representativeSalesReports')))
			.then(data => {
				let representativeSalesReportIds = handler.getReportIds(data);

				// 通过 representativeSalesReport 的 id，获取其关联的 resourceConfig
				return all(representativeSalesReportIds.map(ele => {
					return store.findRecord('representativeSalesReport', ele);
				}));
			}).then(data => {
				representativeSalesReports = data;

				return all(representativeSalesReports.map(ele => ele.get('resourceConfig')));
			}).then(data => {
				representativeSalesReportsResourceConfigs = data;
				return all(data.map(ele => ele.get('representativeConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('representative')));
			}).then(data => {
				representativeSalesReportsReps = data.map((ele, index) => {
					return {
						name: ele.name,
						representative: ele,
						goodsConfig: representativeSalesReports[index].goodsConfig,
						report: representativeSalesReports[index]
					};
				});
				// 整理季度数据
				formatRepresentativeSalesReports = handler.formatReports(tmpHeadQ, representativeSalesReportsReps, resourceConfigRepresentatives.length);

				doubleCircleRep = handler.salesConstruct(formatRepresentativeSalesReports);
				barLineDataRep = handler.salesTrend(barLineKeys, formatRepresentativeSalesReports, tmpHeadQ);

				let repCustomHead = [`指标贡献率`, `指标增长率`, `指标达成率`, `销售额同比增长`, `销售额环比增长`, `销售额贡献率`,
					`YTD销售额`];

				tableHeadRep.push('代表名称', '患者数量');
				tableHeadRep = handler.generateTableHead(tableHeadRep, tmpHeadQ, repCustomHead);
				tableBodyRep = resourceConfigRepresentatives.map(ele => {
					let lastSeasonReports = formatRepresentativeSalesReports.slice(-1).lastObject.dataReports,
						currentItem = lastSeasonReports.findBy('representative.id', ele.get('representativeConfig.representative.id')),
						currentItemReport = currentItem.report,
						currentItemTotalSeason = formatRepresentativeSalesReports.map(item => {
							return item.dataReports.findBy('representative.id', ele.get('representativeConfig.representative.id'));
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
					result.push(...currentItemTotalSeason.map(ele => ele.report.salesQuota));
					result.push(...currentItemTotalSeason.map(ele => ele.report.sales));
					return result;
				});
				return hash({
					selfGoodsConfigs,
					resourceConfigRepresentatives,
					representativeSalesReports,
					representativeSalesReportsResourceConfigs,
					representativeSalesReportsReps,
					formatRepresentativeSalesReports,
					tableHeadRep,
					tableBodyRep,
					doubleCircleRep,
					barLineDataRep
				});
			});
	},
	setupController(controller, model) {
		this._super(controller, model);
		this.controller.set('doubleCircleData', model.doubleCircleRep);
		this.controller.set('tableHead', model.tableHeadRep);
		this.controller.set('tableBody', model.tableBodyRep);
	}
});
