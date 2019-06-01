import Controller from '@ember/controller';
import { A } from '@ember/array';

export default Controller.extend({
	salesGroupValue: 0,
	actions: {
		changeSalesValue(value) {
			this.set('salesGroupValue', value);
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
