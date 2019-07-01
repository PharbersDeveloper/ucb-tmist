import Controller from '@ember/controller';
import ENV from 'ucb-tmist/config/environment';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';

export default Controller.extend({
	salesGroupValue: 0,
	circlePie: A([0, 90]),
	pageContent: A(['产品', '地区', '代表', '医院']),
	tmpRsr: null,
	tmpRep: null,
	tmpReg: null,

	handler: service('serviceResultHandler'),
	barLineData: computed('productChooseProduct.id', 'date', function () {
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
	},

	actions: {
		changeSalesValue(value) {
			this.set('salesGroupValue', value);
			if (value === 0) {
				this.set('doubleCircleData', this.get('proDoubleCircleProduct'));
				this.set('barLineData', this.get('proBarLineData'));
			} else if (value === 1) {
				this.set('doubleCircleData', this.get('regDoubleCircleProduct'));
				this.set('barLineData', this.get('regBarLineData'));
			} else if (value === 2) {
				this.set('doubleCircleData', this.get('repDoubleCircleProduct'));
				this.set('barLineData', this.get('repBarLineData'));
			} else if (value === 3) {
				this.set('doubleCircleData', this.get('hospDoubleCircleProduct'));
				this.set('barLineData', this.get('hospBarLineData'));
			}
		}

	}
});
