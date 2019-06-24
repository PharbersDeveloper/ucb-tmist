import Route from '@ember/routing/route';
import { all, hash } from 'rsvp';
import { A } from '@ember/array';

export default Route.extend({
    model(param) {
        let assId = param.assReportId,
            assessmentReport = this.store.findRecord('assessmentReport', assId),
            scenarioResults =A([]);
        
        return assessmentReport.then(data => {
            return data.get('simplifyResult.scenarioResults');
        }).then(data => {
            scenarioResults = data;
            
            return hash({
                scenarioResults: scenarioResults,
                assessmentReport: assessmentReport
            });
        })
    }
});
