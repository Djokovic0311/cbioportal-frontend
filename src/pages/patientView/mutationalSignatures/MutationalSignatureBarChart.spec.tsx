import React from 'react';
import { assert } from 'chai';
import { IMutationalCounts } from 'shared/model/MutationalSignature';
import { IMutationalSignature } from 'shared/model/MutationalSignature';
import { IMutationalBarChartProps } from './MutationalSignatureBarChart';
import {
    IColorDataBar,
    getColorsForSignatures,
    getPercentageOfMutationalCount,
} from './MutationalSignatureBarChartUtils';
const sampleMutationalSignatureDataWithoutClass = [
    {
        uniqueSampleKey: 's09e3B34',
        patientId: 'TestPatient001',
        sampleId: 'sampleID1',
        uniquePatientKey: '34a8e91b3',
        studyId: 'TestStudy001',
        mutationalSignatureLabel: 'A[C>T]G',
        mutationalSignatureClass: '',
        version: 'v2',
        value: 15,
    },
    {
        uniqueSampleKey: 's09e3B34',
        patientId: 'TestPatient001',
        uniquePatientKey: '34a8e91b3',
        sampleId: 'sampleID2',
        studyId: 'TestStudy001',
        mutationalSignatureLabel: 'A[C>T]G',
        mutationalSignatureClass: '',
        version: 'v2',
        value: 12,
    },
    {
        uniqueSampleKey: 's09e3B34',
        patientId: 'TestPatient001',
        uniquePatientKey: '34a8e91b3',
        sampleId: 'sampleID3',
        studyId: 'TestStudy001',
        mutationalSignatureLabel: 'A[C>T]G',
        mutationalSignatureClass: '',
        version: 'v2',
        value: 20,
    },
];

const sampleMutationalSignatureData: IMutationalCounts[] = [
    {
        uniqueSampleKey: 's09e3B34',
        patientId: 'TestPatient001',
        sampleId: 'sampleID1',
        uniquePatientKey: '34a8e91b3',
        studyId: 'TestStudy001',
        mutationalSignatureLabel: 'A[C>T]G',
        mutationalSignatureClass: 'C>T',
        version: 'v2',
        value: 15,
    },
    {
        uniqueSampleKey: 's09e3B34',
        patientId: 'TestPatient001',
        uniquePatientKey: '34a8e91b3',
        sampleId: 'sampleID2',
        studyId: 'TestStudy001',
        mutationalSignatureLabel: 'A[C>T]G',
        mutationalSignatureClass: 'C>T',
        version: 'v2',
        value: 12,
    },
    {
        uniqueSampleKey: 's09e3B34',
        patientId: 'TestPatient001',
        uniquePatientKey: '34a8e91b3',
        sampleId: 'sampleID3',
        studyId: 'TestStudy001',
        mutationalSignatureLabel: 'A[T>A]G',
        mutationalSignatureClass: 'T>A',
        version: 'v2',
        value: 20,
    },
];

describe('MutationalSignatureBarChart', () => {
    it('Takes unsorted IMutationalCounts[] and transforms it to sorted IColorDataChart', () => {
        let result = getColorsForSignatures(sampleMutationalSignatureData);
        assert.deepEqual(result, [
            {
                uniqueSampleKey: 's09e3B34',
                patientId: 'TestPatient001',
                sampleId: 'sampleID1',
                uniquePatientKey: '34a8e91b3',
                studyId: 'TestStudy001',
                mutationalSignatureLabel: 'A[C>T]G',
                mutationalSignatureClass: 'C>T',
                version: 'v2',
                value: 15,
                colorValue: 'red',
                label: 'A[C>T]G',
                subcategory: ' ',
                group: 'C>T',
            },
            {
                uniqueSampleKey: 's09e3B34',
                patientId: 'TestPatient001',
                sampleId: 'sampleID2',
                uniquePatientKey: '34a8e91b3',
                studyId: 'TestStudy001',
                mutationalSignatureLabel: 'A[C>T]G',
                mutationalSignatureClass: 'C>T',
                version: 'v2',
                value: 12,
                colorValue: 'red',
                label: 'A[C>T]G',
                subcategory: ' ',
                group: 'C>T',
            },

            {
                uniqueSampleKey: 's09e3B34',
                patientId: 'TestPatient001',
                sampleId: 'sampleID3',
                uniquePatientKey: '34a8e91b3',
                studyId: 'TestStudy001',
                mutationalSignatureLabel: 'A[T>A]G',
                mutationalSignatureClass: 'T>A',
                version: 'v2',
                value: 20,
                colorValue: 'grey',
                subcategory: ' ',
                label: 'A[T>A]G',
                group: 'T>A',
            },
        ]);
    });
    it('Takes unsorted IMutationalCounts[] and transforms it to unsorted IColorDataChart', () => {
        let result = getColorsForSignatures(
            sampleMutationalSignatureDataWithoutClass
        );
        assert.deepEqual(result, [
            {
                uniqueSampleKey: 's09e3B34',
                patientId: 'TestPatient001',
                sampleId: 'sampleID1',
                uniquePatientKey: '34a8e91b3',
                studyId: 'TestStudy001',
                mutationalSignatureLabel: 'A[C>T]G',
                version: 'v2',
                value: 15,
                colorValue: 'red',
                label: 'A[C>T]G',
                subcategory: ' ',
                mutationalSignatureClass: '',
                group: 'C>T',
            },
            {
                uniqueSampleKey: 's09e3B34',
                patientId: 'TestPatient001',
                sampleId: 'sampleID2',
                uniquePatientKey: '34a8e91b3',
                studyId: 'TestStudy001',
                mutationalSignatureLabel: 'A[C>T]G',
                version: 'v2',
                value: 12,
                colorValue: 'red',
                label: 'A[C>T]G',
                subcategory: ' ',
                mutationalSignatureClass: '',
                group: 'C>T',
            },

            {
                uniqueSampleKey: 's09e3B34',
                patientId: 'TestPatient001',
                sampleId: 'sampleID3',
                uniquePatientKey: '34a8e91b3',
                studyId: 'TestStudy001',
                mutationalSignatureLabel: 'A[C>T]G',
                version: 'v2',
                value: 20,
                colorValue: 'red',
                label: 'A[C>T]G',
                subcategory: ' ',
                mutationalSignatureClass: '',
                group: 'C>T',
            },
        ]);
    });
});
