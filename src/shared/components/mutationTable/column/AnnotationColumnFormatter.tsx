import * as React from 'react';
import {If} from 'react-if';
import * as _ from "lodash";
import {
    HotspotAnnotation,
    hotspotAnnotationSortValue,
    OncoKB,
    oncoKbAnnotationDownload,
    oncoKbAnnotationSortValue
} from "react-mutation-mapper";
import OncoKbEvidenceCache from "shared/cache/OncoKbEvidenceCache";
import OncokbPubMedCache from "shared/cache/PubMedCache";
import MyCancerGenome from "shared/components/annotation/MyCancerGenome";
import Civic from "shared/components/annotation/Civic";
import {IOncoKbCancerGenesWrapper, IOncoKbData, IOncoKbDataWrapper} from "shared/model/OncoKB";
import Trial from "shared/components/annotation/Trial";
import {IMyCancerGenomeData, IMyCancerGenome} from "shared/model/MyCancerGenome";
import {IHotspotDataWrapper} from "shared/model/CancerHotspots";
import {CancerStudy, Mutation} from "shared/api/generated/CBioPortalAPI";
import {CancerGene, IndicatorQueryResp, Query} from "public-lib/api/generated/OncoKbAPI";
import {getEvidenceQuery} from "shared/lib/OncoKbUtils";
import {generateQueryVariantId} from "public-lib/lib/OncoKbUtils";
import {is3dHotspot, isRecurrentHotspot} from "shared/lib/AnnotationUtils";
import {ICivicVariant, ICivicGene, ICivicEntry, ICivicVariantData, ICivicGeneData,
        ICivicGeneDataWrapper, ICivicVariantDataWrapper} from "shared/model/Civic.ts";
import {ITrialMatchVariant, ITrialMatchGene, ITrialMatchEntry, ITrialMatchVariantData,
        ITrialMatchGeneData, ITrialMatchGeneDataWrapper, ITrialMatchVariantDataWrapper} from "shared/model/TrialMatch.ts";
import {buildCivicEntry} from "shared/lib/CivicUtils";
import {buildTrialMatchEntry} from "shared/lib/TrialMatchUtils";

export interface IAnnotationColumnProps {
    enableOncoKb: boolean;
    enableMyCancerGenome: boolean;
    enableHotspot: boolean;
    enableCivic: boolean;
    enableTrialMatch: boolean;
    hotspotData?: IHotspotDataWrapper;
    myCancerGenomeData?: IMyCancerGenomeData;
    oncoKbData?: IOncoKbDataWrapper;
    oncoKbEvidenceCache?: OncoKbEvidenceCache;
    oncoKbCancerGenes? :IOncoKbCancerGenesWrapper;
    pubMedCache?: OncokbPubMedCache;
    userEmailAddress?:string;
    civicGenes?: ICivicGeneDataWrapper;
    civicVariants?: ICivicVariantDataWrapper;
    trialMatchGenes?: ITrialMatchGeneDataWrapper;
    trialMatchVariants?: ITrialMatchVariantDataWrapper;
    studyIdToStudy?: {[studyId:string]:CancerStudy};
}

export interface IAnnotation {
    isHotspot: boolean;
    is3dHotspot: boolean;
    hotspotStatus: "pending" | "error" | "complete";
    myCancerGenomeLinks: string[];
    oncoKbIndicator?: IndicatorQueryResp;
    oncoKbStatus: "pending" | "error" | "complete";
    oncoKbGeneExist:boolean;
    isOncoKbCancerGene:boolean;
    civicEntry?: ICivicEntry | null;
    civicStatus: "pending" | "error" | "complete";
    hasCivicVariants: boolean;
    trialMatchEntry?: ITrialMatchEntry | null;
    trialMatchStatus: "pending" | "error" | "complete";
    hasTrialMatchVariants: boolean;
    hugoGeneSymbol:string;
}

/**
 * @author Selcuk Onur Sumer
 */
export default class AnnotationColumnFormatter
{
    public static get DEFAULT_ANNOTATION_DATA(): IAnnotation
    {
        return {
            oncoKbStatus: "complete",
            oncoKbGeneExist: false,
            isOncoKbCancerGene: false,
            myCancerGenomeLinks: [],
            isHotspot: false,
            is3dHotspot: false,
            hotspotStatus: "complete",
            hasCivicVariants: true,
            hugoGeneSymbol: '',
            civicStatus: "complete",
            hasTrialMatchVariants: true,
            trialMatchStatus: "complete"
        };
    }

    public static getData(rowData:Mutation[]|undefined,
                          oncoKbCancerGenes?:IOncoKbCancerGenesWrapper,
                          hotspotData?:IHotspotDataWrapper,
                          myCancerGenomeData?:IMyCancerGenomeData,
                          oncoKbData?:IOncoKbDataWrapper,
                          civicGenes?:ICivicGeneDataWrapper,
                          civicVariants?:ICivicVariantDataWrapper,
                          trialMatchGenes?:ITrialMatchGeneDataWrapper,
                          trialMatchVariants?:ITrialMatchVariantDataWrapper,
                          studyIdToStudy?: {[studyId:string]:CancerStudy})
    {
        let value: Partial<IAnnotation>;

        if (rowData) {
            const mutation = rowData[0];

            let oncoKbIndicator: IndicatorQueryResp|undefined;
            let hugoGeneSymbol = mutation.gene.hugoGeneSymbol;

            let oncoKbGeneExist = false;
            let isOncoKbCancerGene = false;
            if( oncoKbCancerGenes && !(oncoKbCancerGenes instanceof Error)) {
                oncoKbGeneExist = _.find(oncoKbCancerGenes.result, (gene: CancerGene) => gene.oncokbAnnotated && gene.entrezGeneId === mutation.entrezGeneId) !== undefined;
                isOncoKbCancerGene = _.find(oncoKbCancerGenes.result, (gene: CancerGene) => gene.entrezGeneId === mutation.entrezGeneId) !== undefined;
            }

            value = {
                hugoGeneSymbol,
                oncoKbGeneExist,
                isOncoKbCancerGene,
                civicEntry: civicGenes && civicGenes.result && civicVariants && civicVariants.result ?
                    AnnotationColumnFormatter.getCivicEntry(mutation, civicGenes.result, civicVariants.result) : undefined,
                civicStatus: civicGenes && civicGenes.status && civicVariants && civicVariants.status ?
                        AnnotationColumnFormatter.getCivicStatus(civicGenes.status, civicVariants.status) : "pending",
                hasCivicVariants: true,
                trialMatchEntry: trialMatchGenes && trialMatchGenes.result && trialMatchVariants && trialMatchVariants.result ?
                    AnnotationColumnFormatter.getTrialMatchEntry(mutation, trialMatchGenes.result, trialMatchVariants.result) : undefined,
                trialMatchStatus: trialMatchGenes && trialMatchGenes.status && trialMatchVariants && trialMatchVariants.status ?
                    AnnotationColumnFormatter.getTrialMatchStatus(trialMatchGenes.status, trialMatchVariants.status) : "pending",
                hasTrialMatchVariants: true,
                myCancerGenomeLinks: myCancerGenomeData ?
                    AnnotationColumnFormatter.getMyCancerGenomeLinks(mutation, myCancerGenomeData) : [],
                isHotspot: hotspotData && hotspotData.result && hotspotData.status === "complete" ?
                    isRecurrentHotspot(mutation, hotspotData.result) : false,
                is3dHotspot: hotspotData && hotspotData.result && hotspotData.status === "complete" ?
                    is3dHotspot(mutation, hotspotData.result) : false,
                hotspotStatus: hotspotData ? hotspotData.status : "pending"
            };

            // oncoKbData may exist but it might be an instance of Error, in that case we flag the status as error
            if (oncoKbData && oncoKbData.result instanceof Error) {
                value = {
                    ...value,
                    oncoKbStatus: "error",
                    oncoKbIndicator: undefined
                };
            }
            else if (oncoKbGeneExist) {
                // actually, oncoKbData.result shouldn't be an instance of Error in this case (we already check it above),
                // but we need to check it again in order to avoid TS errors/warnings
                if (oncoKbData &&
                    oncoKbData.result &&
                    !(oncoKbData.result instanceof Error) &&
                    oncoKbData.status === "complete")
                {
                    oncoKbIndicator = AnnotationColumnFormatter.getIndicatorData(mutation, oncoKbData.result, studyIdToStudy);
                }

                value = {
                    ...value,
                    oncoKbStatus: oncoKbData ? oncoKbData.status : "pending",
                    oncoKbIndicator,
                };
            } else {
                value = {
                    ...value,
                    oncoKbStatus: "complete",
                    oncoKbIndicator: undefined
                };
            }
        }
        else {
            value = AnnotationColumnFormatter.DEFAULT_ANNOTATION_DATA;
        }

        return value as IAnnotation;
    }

    /**
     * Returns an ICivicEntry if the civicGenes and civicVariants have information about the gene and the mutation (variant) specified. Otherwise it returns null.
     */
    public static getCivicEntry(mutation:Mutation, civicGenes:ICivicGene, civicVariants:ICivicVariant): ICivicEntry | null
    {
        let geneSymbol: string = mutation.gene.hugoGeneSymbol;
        let civicEntry = null;
        //Only search for matching Civic variants if the gene mutation exists in the Civic API
        if (civicGenes[geneSymbol] && civicVariants[geneSymbol] && civicVariants[geneSymbol][mutation.proteinChange]) {
            let geneVariants: {[name: string]: ICivicVariantData} = {[mutation.proteinChange]: civicVariants[geneSymbol][mutation.proteinChange]};
            let geneEntry: ICivicGeneData = civicGenes[geneSymbol];
            civicEntry = buildCivicEntry(geneEntry, geneVariants);
        }

        return civicEntry;
    }
    
    public static getCivicStatus(civicGenesStatus:"pending" | "error" | "complete",
                                 civicVariantsStatus:"pending" | "error" | "complete"): "pending" | "error" | "complete"
    {
        if (civicGenesStatus === "error" || civicVariantsStatus === "error") {
            return "error";
        }
        if (civicGenesStatus === "complete" && civicVariantsStatus === "complete") {
            return "complete";
        }

        return "pending";
    }

    public static getTrialMatchEntry(mutation:Mutation, trialMatchGenes:ITrialMatchGene,
                                     trialMatchVariants:ITrialMatchVariant): ITrialMatchEntry | null
    {
        let geneSymbol: string = mutation.gene.hugoGeneSymbol;
        let trialMatchEntry = null;
        //Only search for matching Trial variants if the gene mutation exists in the Trial API
        if (trialMatchVariants[geneSymbol] && trialMatchVariants[geneSymbol][mutation.proteinChange]) {
            let geneVariants: {[name: string]: ITrialMatchVariantData} = {[mutation.proteinChange]: trialMatchVariants[geneSymbol][mutation.proteinChange]};
            let geneEntry: ITrialMatchGeneData = trialMatchGenes[geneSymbol];
            trialMatchEntry = buildTrialMatchEntry(geneEntry, geneVariants);
        }

        return trialMatchEntry;
    }

    public static getTrialMatchStatus(trialMatchGenesStatus:"pending" | "error" | "complete",
                                      trialMatchVariantsStatus:"pending" | "error" | "complete"): "pending" | "error" | "complete"
    {
        if (trialMatchGenesStatus === "error" || trialMatchVariantsStatus === "error") {
            return "error";
        }
        if (trialMatchGenesStatus === "complete" && trialMatchVariantsStatus === "complete") {
            return "complete";
        }

        return "pending";
    }

    public static getIndicatorData(mutation:Mutation, oncoKbData:IOncoKbData, studyIdToStudy?: {[studyId:string]:CancerStudy}): IndicatorQueryResp|undefined
    {
        {
        if (oncoKbData.uniqueSampleKeyToTumorType === null || oncoKbData.indicatorMap === null) {
            return undefined;
        }
        
        const id = generateQueryVariantId(
            mutation.gene.entrezGeneId,
            oncoKbData.uniqueSampleKeyToTumorType[mutation.uniqueSampleKey],
            mutation.proteinChange,
            mutation.mutationType
        );

        const indicator = oncoKbData.indicatorMap[id];

        if (indicator && indicator.query.tumorType === null && studyIdToStudy) {
            const studyMetaData = studyIdToStudy[mutation.studyId];
            if (studyMetaData.cancerTypeId !== "mixed") {           
                indicator.query.tumorType = studyMetaData.cancerType.name;
            }
        }

        return indicator;
    }

    public static getEvidenceQuery(mutation:Mutation, oncoKbData:IOncoKbData): Query|undefined
    {
        return getEvidenceQuery(mutation, oncoKbData);
    }

    public static getMyCancerGenomeLinks(mutation:Mutation, myCancerGenomeData: IMyCancerGenomeData):string[] {
        const myCancerGenomes:IMyCancerGenome[]|null = myCancerGenomeData[mutation.gene.hugoGeneSymbol];
        let links:string[] = [];

        if (myCancerGenomes) {
            // further filtering required by alteration field
            links = AnnotationColumnFormatter.filterByAlteration(mutation, myCancerGenomes).map(
                (myCancerGenome:IMyCancerGenome) => myCancerGenome.linkHTML);
        }

        return links;
    }

    // TODO for now ignoring anything but protein change position, this needs to be improved!
    public static filterByAlteration(mutation:Mutation, myCancerGenomes:IMyCancerGenome[]):IMyCancerGenome[]
    {
        return myCancerGenomes.filter((myCancerGenome:IMyCancerGenome) => {
            const proteinChangeRegExp:RegExp = /^[A-Za-z][0-9]+[A-Za-z]/;
            const numericalRegExp:RegExp = /[0-9]+/;

            const matched = myCancerGenome.alteration.trim().match(proteinChangeRegExp);

            if (matched && mutation.proteinChange)
            {
                const mutationPos = mutation.proteinChange.match(numericalRegExp);
                const alterationPos = myCancerGenome.alteration.match(numericalRegExp);

                return (mutationPos && alterationPos && mutationPos[0] === alterationPos[0]);
            }

            return false;
        });
    }

    public static sortValue(data:Mutation[],
                            oncoKbCancerGenes?: IOncoKbCancerGenesWrapper,
                            hotspotData?: IHotspotDataWrapper,
                            myCancerGenomeData?:IMyCancerGenomeData,
                            oncoKbData?: IOncoKbDataWrapper,
                            civicGenes?: ICivicGeneDataWrapper,
                            civicVariants?: ICivicVariantDataWrapper,
                            trialMatchGenes?: ITrialMatchGeneDataWrapper,
                            trialMatchVariants?: ITrialMatchVariantDataWrapper):number[] {
        const annotationData:IAnnotation = AnnotationColumnFormatter.getData(
            data, oncoKbCancerGenes, hotspotData, myCancerGenomeData, oncoKbData,
            civicGenes, civicVariants, trialMatchGenes, trialMatchVariants);

        return _.flatten([
            OncoKB.sortValue(annotationData.oncoKbIndicator),
            Trial.sortValue(annotationData.trialMatchEntry),
            MyCancerGenome.sortValue(annotationData.myCancerGenomeLinks),
            hotspotAnnotationSortValue(annotationData.isHotspot, annotationData.is3dHotspot), annotationData.isOncoKbCancerGene ? 1 : 0
        ]);
    }

    public static download(data:Mutation[]|undefined,
                           oncoKbCancerGenes?: IOncoKbCancerGenesWrapper,
                           hotspotData?:IHotspotDataWrapper,
                           myCancerGenomeData?:IMyCancerGenomeData,
                           oncoKbData?:IOncoKbDataWrapper,
                           civicGenes?:ICivicGeneDataWrapper,
                           civicVariants?:ICivicVariantDataWrapper,
                           trialMatchGenes?:ITrialMatchGeneDataWrapper,
                           trialMatchVariants?:ITrialMatchVariantDataWrapper)
    {
        const annotationData:IAnnotation = AnnotationColumnFormatter.getData(
            data, oncoKbCancerGenes, hotspotData, myCancerGenomeData, oncoKbData,
            civicGenes, civicVariants, trialMatchGenes, trialMatchVariants);

        return [
            `OncoKB: ${OncoKB.download(annotationData.oncoKbIndicator)}`,
            `CIViC: ${Civic.download(annotationData.civicEntry)}`,
            `TrialMatch: ${Trial.download(annotationData.trialMatchEntry)}`,
            `MyCancerGenome: ${MyCancerGenome.download(annotationData.myCancerGenomeLinks)}`,
            `CancerHotspot: ${annotationData.isHotspot ? 'yes' : 'no'}`,
            `3DHotspot: ${annotationData.is3dHotspot ? 'yes' : 'no'}`,
        ].join(";");
    }

    public static renderFunction(data:Mutation[], columnProps:IAnnotationColumnProps)
    {
        const annotation:IAnnotation = AnnotationColumnFormatter.getData(
            data,
            columnProps.oncoKbCancerGenes,
            columnProps.hotspotData,
            columnProps.myCancerGenomeData,
            columnProps.oncoKbData,
            columnProps.civicGenes,
            columnProps.civicVariants,
            columnProps.trialMatchGenes,
            columnProps.trialMatchVariants,
            columnProps.studyIdToStudy,
            );

        let evidenceQuery:Query|undefined;

        if (columnProps.oncoKbData &&
            columnProps.oncoKbData.result &&
            !(columnProps.oncoKbData.result instanceof Error))
        {
            evidenceQuery = this.getEvidenceQuery(data[0], columnProps.oncoKbData.result);
        }
        
        return AnnotationColumnFormatter.mainContent(annotation,
            columnProps,
            columnProps.oncoKbEvidenceCache,
            evidenceQuery,
            columnProps.pubMedCache);
    }

    public static mainContent(annotation:IAnnotation,
                              columnProps:IAnnotationColumnProps,
                              evidenceCache?: OncoKbEvidenceCache,
                              evidenceQuery?: Query,
                              pubMedCache?:OncokbPubMedCache)
    {
        return (
            <span style={{display:'flex', minWidth:100}}>
                <If condition={columnProps.enableOncoKb || false}>
                    <OncoKB
                        hugoGeneSymbol={annotation.hugoGeneSymbol}
                        geneNotExist={!annotation.oncoKbGeneExist}
                        isCancerGene={annotation.isOncoKbCancerGene}
                        status={annotation.oncoKbStatus}
                        indicator={annotation.oncoKbIndicator}
                        evidenceCache={evidenceCache}
                        evidenceQuery={evidenceQuery}
                        pubMedCache={pubMedCache}
                        userEmailAddress={columnProps.userEmailAddress}
                    />
                </If>
                <If condition={columnProps.enableCivic || false}>
                    <Civic
                        civicEntry={annotation.civicEntry}
                        civicStatus={annotation.civicStatus}
                        hasCivicVariants={annotation.hasCivicVariants}
                    />
                </If>
                <If condition={columnProps.enableMyCancerGenome || false}>
                    <MyCancerGenome
                        linksHTML={annotation.myCancerGenomeLinks}
                    />
                </If>
                <If condition={columnProps.enableHotspot || false}>
                    <HotspotAnnotation
                        isHotspot={annotation.isHotspot}
                        is3dHotspot={annotation.is3dHotspot}
                        status={annotation.hotspotStatus}
                    />
                </If>
                <If condition={columnProps.enableTrialMatch || false}>
                    <Trial
                        trialMatchEntry={annotation.trialMatchEntry}
                        trialMatchStatus={annotation.trialMatchStatus}
                        hasTrialMatchVariants={annotation.hasTrialMatchVariants}
                    />
                </If>
            </span>
        );
    }
}
