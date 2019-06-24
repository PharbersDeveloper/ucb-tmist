import Controller from '@ember/controller';
import ENV from 'ucb-tmist/config/environment';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { all, reject } from 'rsvp';
import { A } from '@ember/array';


export default Controller.extend({
	axios: service(),
	ajax: service(),
	cookies: service(),
	serviceCycle: service(),
	actions: {
		continueTest() {
			// let pageIndexModel = this.modelFor('index');

			window.location = ENV.redirectUri;

			// this.transitionToRoute('index');
			// this.serviceCycle.set('needRefresh', true);
			// this.serviceCycle.set('needRedirectToSce', true);
		},
		checkManagerReport() {
			this.transitionToRoute('page-report');
		},
		outputData(type) {
			const applicationAdapter = this.store.adapterFor('application'),
				{ ajax, axios } = this;

			let version = `${applicationAdapter.get('namespace')}`,
				fileNames = A([]),
				proposalId = localStorage.getItem('proposalId');

			ajax.request(`${version}/GenerateCSV`, {
				method: 'POST',
				data: JSON.stringify({
					'proposal-id': proposalId,
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
					let content = res.data,
						blob = new Blob([content], { type: 'text/csv' }),
						fileName = fileNames[index].split('=')[1];

					if ('download' in document.createElement('a')) { // 非IE下载
						let elink = document.createElement('a');

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
		}
	}
});
