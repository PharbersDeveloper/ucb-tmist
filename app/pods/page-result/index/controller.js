import Controller from '@ember/controller';
import ENV from 'ucb-tmist/config/environment';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Controller.extend({
	circlePie: A([0, 90]),
	handler: service('serviceResultHandler'),
	barLineData: computed('productChooseProduct.id', function () {
		if (ENV.environment === 'development') {
			window.console.log('recomputed 产品销售趋势图');
		}
		const { model } = this,
			{ formatSelfProductSalesReports } = model,
			handler = this.handler;

		let { productChooseProduct } = this,
			findProductItemValue = isEmpty(productChooseProduct) ? productChooseProduct : productChooseProduct.get('goodsId'),
			findProductItemKey = 'goodsConfig.goodsId';

		return handler.changeTrendData(model.barLineDataProduct, formatSelfProductSalesReports, findProductItemKey, findProductItemValue);
	}),
	init() {
		this._super(...arguments);
		// 初始化 全部选择 的一些数据
		this.set('totalProduct', { id: 'totalProduct', productName: '全部选择' });
		this.set('totalRepresentatives', { id: 'totalRepresentatives', representativeName: '全部选择' });
		this.set('totalHospitals', { id: 'totalHospitals', hospitalName: '全部选择' });
		// this.set('doubleCircleData', A([
		// 	{
		// 		seriesName: '2018Q1', data: A([
		// 			{ value: 61089, name: 'Kosovo' },
		// 			{ value: 38922, name: 'Cyprus' },
		// 			{ value: 23204, name: 'Ireland' }
		// 		])
		// 	},
		// 	{
		// 		seriesName: '2018Q2', data: A([
		// 			{ value: 60954, name: 'Kosovo' },
		// 			{ value: 48258, name: 'Cyprus' },
		// 			{ value: 63933, name: 'Ireland' }
		// 		])
		// 	}
		// ]));
		// this.set('barLineData', A([
		// 	{
		// 		name: '销售额',
		// 		date: ['2018Q1', '2018Q2', '2018Q3', '2018Q4', '2019Q1', '2019Q2', '2019Q3', '2019Q4'],
		// 		data: [782.0, 874.9, 787.0, 23.2, 25.6, 4135.6, 162.2, 4160],
		// 		yAxisIndex: 1
		// 	},
		// 	{
		// 		name: '指标',
		// 		date: ['2018Q1', '2018Q2', '2018Q3', '2018Q4', '2019Q1', '2019Q2', '2019Q3', '2019Q4'],
		// 		data: [3983, 3407, 2432, 965, 1177, 20.0, 263.4, 334.3],
		// 		yAxisIndex: 1
		// 	},
		// 	{
		// 		name: '指标达成率',
		// 		date: ['2018Q1', '2018Q2', '2018Q3', '2018Q4', '2019Q1', '2019Q2', '2019Q3', '2019Q4'],
		// 		data: [45.0, 52.2, 20.3, 34.4, 23.0, 12.5, 22.0, 6.2],
		// 		yAxisIndex: 0
		// 	}
		// ]));
	}

	// actions: {
	// changeSalesValue(value) {
	// 	this.set('salesGroupValue', value);
	// 	if (value === 0) {
	// 		this.set('doubleCircleData', this.model.doubleCircleProduct);
	// 		this.set('tableHead', this.model.tableHeadProd);
	// 		this.set('tableBody', this.model.tableBodyProd);
	// 		// this.set('barLineData', this.model.barLineDataProduct);
	// 	} else if (value === 1) {
	// 		this.set('doubleCircleData', this.model.doubleCircleCity);
	// 		this.set('tableHead', this.model.tableHeadCity);
	// 		this.set('tableBody', this.model.tableBodyCity);
	// 		// this.set('barLineData', this.model.barLineDataCity);
	// 	} else if (value === 2) {
	// 		this.set('doubleCircleData', this.model.doubleCircleRep);
	// 		this.set('tableHead', this.model.tableHeadRep);
	// 		this.set('tableBody', this.model.tableBodyRep);
	// 		// this.set('barLineData', this.model.barLineDataRep);
	// 	} else if (value === 3) {
	// 		this.set('doubleCircleData', this.model.doubleCircleHosp);
	// 		this.set('tableHead', this.model.tableHeadHosp);
	// 		this.set('tableBody', this.model.tableBodyHosp);
	// 		// this.set('barLineData', this.model.barLineDataHosp);
	// 	}
	// }
	// }
});
