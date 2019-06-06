import Controller from '@ember/controller';
import { A } from '@ember/array';

export default Controller.extend({
	salesGroupValue: 0,
	init() {
		this._super(...arguments);
	},
	actions: {
		changeSalesValue(value) {
			let city = this.model.destConfigRegion.get('regionConfig.region.cities').map(ele => {
				let arr = A([]),
					num = ele.get('hospitalConfigs').length;

				arr.push(ele);
				return {
					cityData: arr,
					hospNum: num
				};
			});

			this.set('salesGroupValue', value);
			this.set('city', city[value]);

			if (value === 1) {
				this.set('tmpCityInfo', {
					name: '城市B',
					destConfigs: A([
						{
							hospitalConfig: {
								hospital: {
									name: '安贞B医院',
									describe: 'describe',
									code: 123,
									hospitalCategory: 'hospitalCategory',
									hospitalLevel: '三级',
									position: '1312 Soliv Grove',
									regtime: '1996/01',
									images: A([
										{ img: 'https://i.loli.net/2019/04/15/5cb4650ddde95.jpg' }
									])
								}
							}
						},
						{
							hospitalConfig: {
								hospital: {
									name: '331B医院',
									describe: 'describe',
									code: 123,
									hospitalCategory: 'hospitalCategory',
									hospitalLevel: '三级',
									position: '1312 Soliv Grove',
									regtime: '1996/01',
									images: A([
										{ img: 'https://i.loli.net/2019/04/15/5cb4650ddde95.jpg' }
									])
								}
							}
						}
					])
				});
			}
		}
	}
});
