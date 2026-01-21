#include "json.hpp"

#include <TFile.h>
#include <TH1.h>
#include <TF1.h>

using json = nlohmann::json;

void generate_hints(TString inputFile, TString outputDir) {
    auto fDataFile = new TFile(inputFile);

    for(auto lnk = fDataFile->GetListOfKeys()->FirstLink(); lnk != nullptr; lnk = lnk->Next()) {
        auto KeyObj = lnk->GetObject();

        auto KeyCast = dynamic_cast<TKey*>(KeyObj);
        auto DirObj = KeyCast->ReadObj();
        auto Directory = dynamic_cast<TDirectoryFile*>(DirObj);

        std::string partName = KeyCast->GetName();

        for(auto lnk2 = Directory->GetListOfKeys()->FirstLink(); lnk2 != nullptr; lnk2 = lnk2->Next() ) {
            auto KeyObj2 = dynamic_cast<TKey*>(lnk2->GetObject());
            auto h = dynamic_cast<TH1*>(KeyObj2->ReadObj());
            auto xaxis = h->GetXaxis();

            Float_t minSig, maxSig, minBck, maxBck;

            if (partName == "K0") {
                minSig = 0.49; maxSig = 0.50; minBck = 0.48; maxBck = 0.51;
            } else {
                minSig = 1.11; maxSig = 1.12; minBck = 1.1; maxBck = 1.14;
            }
            
            std::cout << KeyObj2->GetName() << std::endl;

            auto fFit = new TF1("fit", "gausn(0)+pol2(3)", 0, 2);
            fFit->SetParNames("Y", "#mu", "#sigma", "A", "B", "C");
            fFit->SetRange(minBck, maxBck);
            fFit->SetParameters(80, (minSig + maxSig) / 2, (maxSig - minSig) / 4);
            fFit->SetParLimits(0, 0, 1e9);
            fFit->SetParLimits(1, minSig, maxSig);
            fFit->SetParLimits(2, 0, (maxSig - minSig) / 2);
            TFitResultPtr r = h->Fit(fFit, "NQSR", "", minBck, maxBck);

            std::string path = outputDir.Data();

            std::string cmd = "mkdir -p " + path;

            gSystem->Exec(cmd.c_str());
            path = path + "/" + KeyObj2->GetName() + "_hint.json";
            std::cout << path << std::endl;

            std::ofstream o_hint(path);

            json hint = json::array();

            hint.push_back(fFit->GetParameter(0));
            hint.push_back(fFit->GetParameter(1));
            hint.push_back(fFit->GetParameter(2));
            hint.push_back(fFit->GetParameter(3));
            hint.push_back(fFit->GetParameter(4));
            hint.push_back(fFit->GetParameter(5));

            o_hint << hint << std::endl;

            o_hint.close();
        }
    }
}
