import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import ENV from 'ucb-tmist/config/environment';
import { computed } from '@ember/object';
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
	})
});
