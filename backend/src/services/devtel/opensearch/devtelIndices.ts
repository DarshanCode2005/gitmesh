/**
 * DevTel OpenSearch Index Definitions
 */

export const DEVTEL_ISSUES_INDEX = 'devtel-issues'
export const DEVTEL_SPECS_INDEX = 'devtel-specs'

/**
 * DevTel Issues Index Mapping
 * Full-text search on title, description with facets for status, priority, assignee
 */
export const devtelIssuesMapping = {
    settings: {
        number_of_shards: 1,
        number_of_replicas: 1,
        analysis: {
            analyzer: {
                default: {
                    type: 'standard',
                },
                text_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'asciifolding', 'porter_stem'],
                },
            },
        },
    },
    mappings: {
        properties: {
            id: { type: 'keyword' },
            projectId: { type: 'keyword' },
            cycleId: { type: 'keyword' },
            workspaceId: { type: 'keyword' },
            issueKey: { type: 'keyword' },
            title: {
                type: 'text',
                analyzer: 'text_analyzer',
                fields: {
                    keyword: { type: 'keyword' },
                },
            },
            description: {
                type: 'text',
                analyzer: 'text_analyzer',
            },
            type: { type: 'keyword' },
            status: { type: 'keyword' },
            priority: { type: 'keyword' },
            labels: { type: 'keyword' },
            storyPoints: { type: 'integer' },
            assigneeId: { type: 'keyword' },
            assigneeName: { type: 'text' },
            reporterId: { type: 'keyword' },
            reporterName: { type: 'text' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
            dueDate: { type: 'date' },
        },
    },
}

/**
 * DevTel Specs Index Mapping
 * Full-text search on title and content with facets for status, author
 */
export const devtelSpecsMapping = {
    settings: {
        number_of_shards: 1,
        number_of_replicas: 1,
        analysis: {
            analyzer: {
                default: {
                    type: 'standard',
                },
                text_analyzer: {
                    type: 'custom',
                    tokenizer: 'standard',
                    filter: ['lowercase', 'asciifolding', 'porter_stem'],
                },
            },
        },
    },
    mappings: {
        properties: {
            id: { type: 'keyword' },
            projectId: { type: 'keyword' },
            workspaceId: { type: 'keyword' },
            title: {
                type: 'text',
                analyzer: 'text_analyzer',
                fields: {
                    keyword: { type: 'keyword' },
                },
            },
            content: {
                type: 'text',
                analyzer: 'text_analyzer',
            },
            status: { type: 'keyword' },
            authorId: { type: 'keyword' },
            authorName: { type: 'text' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
        },
    },
}

/**
 * Create or update DevTel indices in OpenSearch
 */
export async function createDevtelIndices(client: any): Promise<void> {
    // Create issues index
    const issuesExists = await client.indices.exists({ index: DEVTEL_ISSUES_INDEX })
    if (!issuesExists.body) {
        await client.indices.create({
            index: DEVTEL_ISSUES_INDEX,
            body: devtelIssuesMapping,
        })
        console.log(`Created index: ${DEVTEL_ISSUES_INDEX}`)
    }

    // Create specs index
    const specsExists = await client.indices.exists({ index: DEVTEL_SPECS_INDEX })
    if (!specsExists.body) {
        await client.indices.create({
            index: DEVTEL_SPECS_INDEX,
            body: devtelSpecsMapping,
        })
        console.log(`Created index: ${DEVTEL_SPECS_INDEX}`)
    }
}

/**
 * Delete DevTel indices
 */
export async function deleteDevtelIndices(client: any): Promise<void> {
    await client.indices.delete({ index: DEVTEL_ISSUES_INDEX, ignore_unavailable: true })
    await client.indices.delete({ index: DEVTEL_SPECS_INDEX, ignore_unavailable: true })
}
