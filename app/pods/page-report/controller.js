import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { all, reject } from 'rsvp';
import { A } from '@ember/array';

export default Controller.extend({
	ajax: service(),
	cookies: service(),
	axios: service(),
	actions: {
		outputData(type) {
			const applicationAdapter = this.store.adapterFor('application'),
				{ ajax, axios } = this;

			let version = `${applicationAdapter.get('namespace')}`,
				fileNames = A([]);

			ajax.request(`${version}/GenerateCSV`, {
				method: 'POST',
				data: JSON.stringify({
					'proposal-id': this.get('proposalId'),
					'account-id': this.get('cookies').read('account_id'),
					'scenario-id': this.model.scenario.get('id'),
					'download-type': type
				})
			}).then(data => {
				if (data.status !== 'ok' || isEmpty(data.fileNames)) {
					return reject();
				}
				fileNames = data.fileNames;
				return all(fileNames.map(ele => {
					return axios.axios({
						url: `${ele}`,
						method: 'get',
						responseType: 'blob'
					});

				}));
			}).then(data => {
				data.forEach((res, index) => {
					const content = res,
						blob = new Blob([content]),
						fileName = fileNames[index];

					if ('download' in document.createElement('a')) { // 非IE下载
						const elink = document.createElement('a');

						elink.download = fileName;
						elink.style.display = 'none';
						elink.href = URL.createObjectURL(blob);
						document.body.appendChild(elink);
						elink.click();
						URL.revokeObjectURL(elink.href); // 释放URL 对象
						document.body.removeChild(elink);
					} else { // IE10+下载
						navigator.msSaveBlob(blob, fileName);
					}
				});
			}).catch(() => {
			});

			// v0 / GenerateCSV
			// {
			// 	"proposal-id": "5cfca8685458460c4b42262c",
			// 		"account-id": "5cd51df9f4ce43ee2495d4dd",
			// 			"scenario-id": "5cfca9115458460c4b422631",
			// 				"download-type": "business"
			// }

		}
	}
});
