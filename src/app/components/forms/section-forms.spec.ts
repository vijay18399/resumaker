import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BasicsFormComponent } from './basics-form.component';
import { SummaryFormComponent } from './summary-form.component';
import { WorkFormComponent } from './work-form.component';
import { ProjectsFormComponent } from './projects-form.component';
import { SkillsFormComponent } from './skills-form.component';
import { EducationFormComponent } from './education-form.component';
import { CertificatesFormComponent } from './certificates-form.component';
import { AwardsFormComponent } from './awards-form.component';
import { LanguagesFormComponent } from './languages-form.component';
import { InterestsFormComponent } from './interests-form.component';
import { VolunteerFormComponent } from './volunteer-form.component';
import { ReferencesFormComponent } from './references-form.component';
import { ResumeStore } from '../../services/resume-store.service';

describe('Section Form Components Suite', () => {
  let store: ResumeStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [
        BasicsFormComponent,
        SummaryFormComponent,
        WorkFormComponent,
        ProjectsFormComponent,
        SkillsFormComponent,
        EducationFormComponent,
        CertificatesFormComponent,
        AwardsFormComponent,
        LanguagesFormComponent,
        InterestsFormComponent,
        VolunteerFormComponent,
        ReferencesFormComponent
      ],
      providers: [ResumeStore]
    });
    store = TestBed.inject(ResumeStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should instantiate all 12 section forms properly', () => {
    const basicsFixture = TestBed.createComponent(BasicsFormComponent);
    const summaryFixture = TestBed.createComponent(SummaryFormComponent);
    const workFixture = TestBed.createComponent(WorkFormComponent);
    const projFixture = TestBed.createComponent(ProjectsFormComponent);
    const skillsFixture = TestBed.createComponent(SkillsFormComponent);
    const eduFixture = TestBed.createComponent(EducationFormComponent);
    const certFixture = TestBed.createComponent(CertificatesFormComponent);
    const awardFixture = TestBed.createComponent(AwardsFormComponent);
    const langFixture = TestBed.createComponent(LanguagesFormComponent);
    const intFixture = TestBed.createComponent(InterestsFormComponent);
    const volFixture = TestBed.createComponent(VolunteerFormComponent);
    const refFixture = TestBed.createComponent(ReferencesFormComponent);

    expect(basicsFixture.componentInstance).toBeTruthy();
    expect(summaryFixture.componentInstance).toBeTruthy();
    expect(workFixture.componentInstance).toBeTruthy();
    expect(projFixture.componentInstance).toBeTruthy();
    expect(skillsFixture.componentInstance).toBeTruthy();
    expect(eduFixture.componentInstance).toBeTruthy();
    expect(certFixture.componentInstance).toBeTruthy();
    expect(awardFixture.componentInstance).toBeTruthy();
    expect(langFixture.componentInstance).toBeTruthy();
    expect(intFixture.componentInstance).toBeTruthy();
    expect(volFixture.componentInstance).toBeTruthy();
    expect(refFixture.componentInstance).toBeTruthy();
  });
});
