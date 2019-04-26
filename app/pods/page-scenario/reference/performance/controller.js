import Controller from '@ember/controller';
import { A } from '@ember/array';

export default Controller.extend({
	salesGroupValue: 0,
	circlePie: A([0, 90]),

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
		}
	}
});
