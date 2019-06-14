import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all, hash } from 'rsvp';
import { A } from '@ember/array';

export default Route.extend({
	handler: service('serviceResultHandler'),
	model() {
		const store = this.get('store'),
			handler = this.handler,
			pageResultModel = this.modelFor('page-scenario'),
			{ increaseSalesReports, tmpHeadQ, selfGoodsConfigs, barLineKeys } = pageResultModel;

		let productsSalesReports = A([]),
			productSalesReportsGoodsConfigs = A([]),
			selfProductSalesReports = A([]),
			formatSelfProductSalesReports = A([]),
			tableHeadProd = A([]),
			tableBodyProd = A([]),
			doubleCircleProduct = A([]),
			barLineDataProduct = A([]);

		//	获取所有salesReport 下的产品销售报告 productSalesReport
		return all(increaseSalesReports.map(ele => ele.get('productSalesReports')))
			.then(data => {
				let productSalesReportIds = handler.getReportIds(data);

				// 通过 productSalesReport 的 id，获取其关联的 goodsConfig
				return all(productSalesReportIds.map(ele => {
					return store.findRecord('productSalesReport', ele);
				}));
			}).then(data => {
				productsSalesReports = data;

				return all(data.map(ele => ele.get('goodsConfig')));
				// 获取本公司产品的产品销售报告
			}).then(data => {
				productSalesReportsGoodsConfigs = data;

				return all(data.map(ele => ele.get('productConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('product')));
			}).then(data => {
				productSalesReportsGoodsConfigs.forEach((ele, index) => {
					selfGoodsConfigs.forEach(item => {
						if (item.get('productConfig.id') === ele.get('goodsId')) {
							selfProductSalesReports.push({
								report: productsSalesReports[index],
								goodsConfig: item,
								name: data[index].name
							});
						}
					});
				});

				// 整理季度数据
				formatSelfProductSalesReports = handler.formatReports(tmpHeadQ, selfProductSalesReports, selfGoodsConfigs.length);
				// 产品销售结构分布图
				doubleCircleProduct = handler.salesConstruct(formatSelfProductSalesReports);
				// 产品销售趋势图
				barLineDataProduct = handler.salesTrend(barLineKeys, formatSelfProductSalesReports, tmpHeadQ);

				// seasonQ = this.seasonQ(tmpHead.lastObject);
				let prodCustomHead = [`指标贡献率`, `指标增长率`, `指标达成率`, `销售额同比增长`, `销售额环比增长`, `销售额贡献率`,
					`YTD销售额`];

				tableHeadProd.push('产品名称');
				tableHeadProd = handler.generateTableHead(tableHeadProd, tmpHeadQ, prodCustomHead);
				tableBodyProd = selfGoodsConfigs.map(ele => {
					let lastSeasonReports = formatSelfProductSalesReports.slice(-1).lastObject.dataReports,
						currentGoods = lastSeasonReports.findBy('goodsConfig.productConfig.product.id', ele.get('productConfig.product.id')),
						currentGoodsReport = currentGoods.report,
						currentGoodsTotalSeason = formatSelfProductSalesReports.map(item => {
							return item.dataReports.findBy('goodsConfig.productConfig.product.id', ele.get('productConfig.product.id'));
						}),
						result = A([]);

					result = [
						ele.get('productConfig.product.name'),
						handler.formatPercent(currentGoodsReport.quotaContribute),
						handler.formatPercent(currentGoodsReport.quotaGrowth),
						handler.formatPercent(currentGoodsReport.quotaAchievement),
						handler.formatPercent(currentGoodsReport.salesYearOnYear),
						handler.formatPercent(currentGoodsReport.salesMonthOnMonth),
						handler.formatPercent(currentGoodsReport.salesContribute),
						handler.formatThousand(currentGoodsReport.ytdSales, '￥')

					];
					result.push(...currentGoodsTotalSeason.map(item => handler.formatThousand(item.report.salesQuota, '￥')));
					result.push(...currentGoodsTotalSeason.map(item => handler.formatThousand(item.report.sales, '￥')));
					return result;
				});
				return hash({
					formatSelfProductSalesReports,
					selfGoodsConfigs,
					doubleCircleProduct,
					barLineDataProduct,
					tableHeadProd,
					tableBodyProd
				});
			});
	},
	setupController(controller, model) {
		this._super(controller, model);
		this.controller.set('doubleCircleData', model.doubleCircleProduct);
		this.controller.set('tableHead', model.tableHeadProd);
		this.controller.set('tableBody', model.tableBodyProd);
	}
});
