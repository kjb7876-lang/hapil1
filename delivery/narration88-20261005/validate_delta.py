#!/usr/bin/env python3
"""Read-only, baseline-gated validator for the 13-path frozen88 integration delta."""
import argparse,hashlib,json,subprocess,sys
from pathlib import Path
P=Path(__file__).resolve().parent
H=lambda b:hashlib.sha256(b).hexdigest()
def read(rel):
    q=Path(rel);assert not q.is_absolute() and '..' not in q.parts
    p=P/q;assert p.is_file() and not any(x.is_symlink() for x in [p,*p.parents]);return p.read_bytes()
def load(rel):return json.loads(read(rel))
def main():
    if sys.flags.optimize:raise RuntimeError('Optimized Python is forbidden; assertions are validation gates.')
    a=argparse.ArgumentParser(description=__doc__);a.add_argument('--repo-root',type=Path,required=True);a.add_argument('--decode',action='store_true');a.add_argument('--verify-applied',action='store_true');args=a.parse_args()
    inv=load('delta-inventory.json');names={x['path'] for x in inv['files']};assert len(names)==len(inv['files'])
    assert names|{'delta-inventory.json'}=={str(p.relative_to(P)) for p in P.rglob('*') if p.is_file()}
    for x in inv['files']:
        data=read(x['path']);assert H(data)==x['sha256'] and len(data)==x['sizeBytes'],x['path']
    c=load('delta-contract.json');old=load('baseline/public86-manifest.json');new=load('assets/story-narration/v1/manifest.json')
    assert H(read('baseline/public86-manifest.json'))==c['baselinePublicManifestSha256']=='2204f5c49e77ceda2cfb6411a2c0a8bd4238d52cfe44133928a642594afa4006'
    assert H(read('assets/story-narration/v1/manifest.json'))==c['targetPublicManifestSha256']=='b8f1c2e9e6883c008b07bc5186f4edb1d2ca8eb7612f29af292d6920150935cc'
    receipt=load('proof/checkpoint794-receipt.json');verification=load('proof/frozen88-verification.json');seal=load('proof/frozen88-seal.json');union=load('proof/backup-union-verification.json')
    assert receipt['checkpointId']=='850910b72c8542b69cd940bb5878f24e' and receipt['checkpointSequence']==794 and receipt['status']=='verified' and receipt['metadataIdentityVerified']
    for rel,member in c['durableBackup']['proofArchiveMembers'].items():
        data=read(rel);assert receipt['fileInventory'][member]=={'sha256':H(data),'sizeBytes':len(data)}
    for k in ['manifestSha256','bindingsSha256','copyPlanSha256']:assert c['frozenIdentity'][k]==seal[k]==verification[k]
    assert verification['status']=='pass' and verification['sceneCount']==88 and verification['selectedMp3Count']==279
    assert verification['protected85RowsLexicallyByteIdentical'] and verification['protected85BindingsLexicallyByteIdentical']
    assert verification['historicalAudibilityFindingsPreserved']==19 and verification['originalEp1b06bAndReferenceMappingsPreserved']
    for k in ['checkpointId','checkpointSequence','archiveSha256','libraryFileId']:assert union[k]==receipt[k]==c['durableBackup'][k]
    assert union['status']=='verified' and union['freezeManifestSha256']==c['frozenIdentity']['manifestSha256'] and union['freezeBindingsSha256']==c['frozenIdentity']['bindingsSha256']
    assert union['copyPlanSha256']==c['frozenIdentity']['copyPlanSha256']
    assert len(old['assets'])==269 and len(old['retiredAssets'])==14 and len(new['assets'])==279 and len(new['retiredAssets'])==16
    assert set(new['coverage']['includedUnits'])==set(old['coverage']['includedUnits'])|{'hando01.pre','kair06.post'}
    assert len(new['coverage']['includedUnits'])==88 and len(new['coverage']['pendingUnits'])==31 and len(new['scenes'])==199
    assert set(new['coverage']['pendingUnits'])==set(old['coverage']['pendingUnits'])-{'hando01.pre','kair06.post'}
    for k in set(old)-{'assets','retiredAssets','scenes','coverage'}:assert old[k]==new[k],k
    retired=set(old['assets'])-set(new['assets']);added=set(new['assets'])-set(old['assets']);assert len(retired)==2 and len(added)==12
    assert sorted(retired)==c['newlyRetiredExistingPaths']
    for name,row in old['assets'].items():assert row==(new['retiredAssets'][name] if name in retired else new['assets'][name])
    for name,row in old['retiredAssets'].items():assert new['retiredAssets'][name]==row
    assert old['originals']==new['originals']==c['originalMappings']
    paths=['assets/story-narration/v1/'+name for name in sorted(added)]+['assets/story-narration/v1/manifest.json']
    assert paths==c['repositoryDeltaPaths'] and len(paths)==13
    assert {str(p.relative_to(P)) for p in (P/'assets').rglob('*') if p.is_file()}==set(paths)
    for name in added:
        row=new['assets'][name];data=read('assets/story-narration/v1/'+name);assert H(data)==row['sha256'] and len(data)==row['bytes']
    # These checks are mandatory; a delta alone cannot prove an unseen repository baseline.
    repo=args.repo_root.resolve()
    def repository_path(rel):
        q=Path(rel);assert not q.is_absolute() and '..' not in q.parts
        p=repo/q
        for ancestor in [p,*p.parents]:
            if ancestor==repo:break
            assert not ancestor.is_symlink(),('Repository target or ancestor is a symlink',str(ancestor))
        if p.exists():assert p.is_file() and p.stat().st_nlink==1,('Repository target is not an independent regular file',str(p))
        return p
    rp=repository_path('assets/story-narration/v1/manifest.json')
    assert rp.is_file() and not rp.is_symlink()
    expected=c['targetPublicManifestSha256'] if args.verify_applied else c['baselinePublicManifestSha256']
    assert H(rp.read_bytes())==expected,'Repository narration manifest differs from the required exact baseline/target. Stop; do not overlay.'
    prior_audio={**old['retiredAssets'],**old['assets']}
    for name,row in prior_audio.items():
        p=repository_path('assets/story-narration/v1/'+name);assert p.is_file();data=p.read_bytes();assert H(data)==row['sha256'] and len(data)==row['bytes'],('Protected existing audio changed',name)
    for row in c['originals']:
        p=repository_path(row['existingRepositoryPath']);assert p.is_file();data=p.read_bytes();assert H(data)==row['sha256'],('Original recording changed',row['id'])
        assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==row['gitBlobSha']
    for name in added:
        p=repository_path('assets/story-narration/v1/'+name)
        if args.verify_applied:assert p.is_file(),('Applied audio missing',name)
        if p.exists():assert H(p.read_bytes())==new['assets'][name]['sha256'],('New asset path collides with different bytes',name)
    if args.decode:
        for name in sorted(added):
            p=P/'assets/story-narration/v1'/name;row=new['assets'][name]
            probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=codec_name,sample_rate,channels,bit_rate:format=duration','-of','json',str(p)],text=True))
            assert probe['streams'][0]=={'codec_name':'mp3','sample_rate':'24000','channels':1,'bit_rate':'128000'}
            assert abs(float(probe['format']['duration'])-float(row['duration']))<.02
            dec=subprocess.run(['ffmpeg','-nostdin','-xerror','-v','error','-i',str(p),'-f','null','-'],check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE);assert dec.stderr==b''
    print(json.dumps({'status':'applied_delta_verified' if args.verify_applied else 'baseline_and_delta_verified','repositoryDeltaPaths':13,
        'newMp3Files':12,'preservedExistingMp3Files':283,'preservedOriginalRecordings':2,'acceptedScenes':88,'selectedMp3Mappings':279,
        'runtimeRoutes':199,'frozenManifestSha256':c['frozenIdentity']['manifestSha256'],'frozenBindingsSha256':c['frozenIdentity']['bindingsSha256'],
        'targetPublicManifestSha256':c['targetPublicManifestSha256'],'newMp3FullDecode':'pass' if args.decode else 'not_requested',
        'repoWritesPerformed':False,'networkOrModelsRun':False},indent=2))
if __name__=='__main__':main()
