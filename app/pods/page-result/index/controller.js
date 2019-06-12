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
	}
});
