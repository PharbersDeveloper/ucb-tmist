import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
// import { isEmpty } from '@ember/utils';
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
			uniqByProducts = A([]),
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
				uniqByProducts = representativeSalesReportsReps.uniqBy('goodsConfig.productConfig.product.id');

				// 整理季度数据
				formatRepresentativeSalesReports = handler.formatReports(tmpHeadQ, representativeSalesReportsReps, resourceConfigRepresentatives.length * uniqByProducts.length);
				doubleCircleRep = handler.salesConstruct(formatRepresentativeSalesReports, 'representative.name');
				barLineDataRep = handler.salesTrend(barLineKeys, formatRepresentativeSalesReports, tmpHeadQ);

				let repCustomHead = [`指标贡献率`, `指标增长率`, `指标达成率`, `销售额同比增长`, `销售额环比增长`, `销售额贡献率`,
						`YTD销售额`],
					lastSeasonReports = formatRepresentativeSalesReports.slice(-1).lastObject.dataReports;

				tableHeadRep.push('代表名称', '患者数量');
				tableHeadRep = handler.generateTableHead(tableHeadRep, tmpHeadQ, repCustomHead);
				tableBodyRep = handler.generateRepTableData(resourceConfigRepresentatives, lastSeasonReports, formatRepresentativeSalesReports);

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
					barLineDataRep,
					uniqByProducts
				});
			});
	}
});
