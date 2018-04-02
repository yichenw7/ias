// 债券交易场所
const 银行间 = 'CIB'; // CHINA INTER BANK
const 上交所 = 'SSE'; // SHANGHAI STOCK EXCHANGE
const 深交所 = 'SZE'; // SHENZHEN STOCK EXCHANGE

// 银行间债券的托管机构
const 上清 = 'sch';
const 中债 = 'cdc';


/**
 * 返回债券是否为银行间债券
 * @param {string} bklm 债券的 bond_key_listed_market
 * @return {boolean} 是否是银行间债券
 */
export function isInterbank(bklm) {
    return bklm && bklm.endsWith(银行间);
}


/**
 * 返回债券是否为交易所债券
 * @param {string} bklm 债券的 bond_key_listed_market
 * @return {boolean} 是否是为交易所债券
 */
export function isExchange(bklm) {
    return bklm && (bklm.endsWith(上交所) || bklm.endsWith(深交所));
}


/**
 * 获取银行间债券的托管机构
 * @param {string} code 债券代码
 * @return {string} 债券的托管机构
 */
export function getBondTrust(code) {
    // 上清的债券代码均为 9 位
    return code.split('.')[0].length === 9 ? 上清 : 中债;
}

export const BondAllocationMap = [
    { label: '现金', assetAllocation: 'asset_total_cash', assetTotalField: 'asset_total_cash_change', assetField: 'asset_cash_change'},
    { label: '国债、金融债', assetAllocation: 'asset_total_bond_treasury_financial', assetTotalField: 'asset_total_bond_treasury_financial_change', assetField: 'asset_bond_treasury_financial_change'},
    { label: '短期债券', assetAllocation: 'asset_total_bond_short_term', assetTotalField: 'asset_total_bond_short_term_change', assetField: 'asset_bond_short_term_change' },
    { label: '中长期债券', assetAllocation: 'asset_total_bond_medium_long_term', assetTotalField: 'asset_total_bond_medium_long_term_change', assetField: 'asset_bond_medium_long_term_change' },
    { label: '同业存单', assetAllocation: 'asset_total_bond_ncd', assetTotalField: 'asset_total_bond_ncd_change', assetField: 'asset_bond_ncd_change' },
    { label: '类固收', assetAllocation: 'asset_total_fixed', assetTotalField: 'asset_total_fixed_change', assetField: 'asset_fixed_change' },
    { label: '基金', assetAllocation: 'asset_total_fund', assetTotalField: 'asset_total_fund_change', assetField: 'asset_fund_change'},
    { label: '股票', assetAllocation: 'asset_total_stock', assetTotalField: 'asset_total_stock_change', assetField: 'asset_stock_change' },
    { label: '衍生品', assetAllocation: 'asset_total_derivative', assetTotalField: 'asset_total_derivative_change', assetField: 'asset_derivative_change' },
    { label: '非标准资产', assetAllocation: 'asset_total_nstd', assetTotalField: 'asset_total_nstd_change', assetField: 'asset_nstd_change' },
    { label: '买入回售', assetAllocation: 'asset_total_rrepo', assetTotalField: 'asset_total_rrepo_change', assetField: 'asset_rrepo_change' },
    { label: '其他', assetAllocation: 'asset_total_other', assetTotalField: 'asset_total_other_change', assetField: 'asset_other_change' },
];
